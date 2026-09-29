import json
import re

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from app.core.config import get_settings

settings = get_settings()

# Any value that isn't a plausible real Gemini key (those look like
# "AIza...") is treated as unconfigured up front, so we never even attempt a
# network call with an obvious placeholder such as "your-gemini-api-key-here".
_PLAUSIBLE_KEY_RE = re.compile(r"^[A-Za-z0-9_\-]{20,}$")


class AIProviderNotConfiguredError(RuntimeError):
    """Raised when a real GEMINI_API_KEY has not been configured yet.

    Per spec section 27 (AI Provider Layer) this is intentionally the only
    provider wired up for now; callers should surface this as a clear,
    actionable error rather than letting the SDK throw an opaque one."""


_NOT_CONFIGURED_MESSAGE = (
    "GEMINI_API_KEY is not configured (or is invalid). Add a real key to "
    "backend/.env (GEMINI_API_KEY=...) — get one at "
    "https://aistudio.google.com/apikey — and restart the API server to "
    "enable AI features."
)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    key = (settings.GEMINI_API_KEY or "").strip()
    if "your" in key.lower() or not _PLAUSIBLE_KEY_RE.match(key):
        raise AIProviderNotConfiguredError(_NOT_CONFIGURED_MESSAGE)
    if _client is None:
        _client = genai.Client(api_key=key)
    return _client


async def _call_gemini(coro):
    """Run a Gemini SDK call, translating an invalid/unauthorized API key
    into our clean, actionable AIProviderNotConfiguredError instead of
    letting the raw provider error surface as a 500."""
    try:
        return await coro
    except genai_errors.ClientError as exc:
        status_code = getattr(exc, "code", None)
        message = str(exc)
        if status_code in (400, 401, 403) and "API_KEY_INVALID" in message or "API key not valid" in message:
            raise AIProviderNotConfiguredError(_NOT_CONFIGURED_MESSAGE) from exc
        raise


def _parse_json(raw: str) -> dict:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
        cleaned = cleaned.removeprefix("json").strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[: -3]
    cleaned = cleaned.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(cleaned)


async def generate_text(
    prompt: str,
    system_instruction: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 8192,
) -> str:
    client = _get_client()
    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    response = await _call_gemini(
        client.aio.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt, config=config)
    )
    return response.text


async def _generate_json(
    prompt: str,
    system_instruction: str,
    temperature: float = 0.4,
    max_tokens: int = 8192,
) -> dict:
    client = _get_client()
    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
        response_mime_type="application/json",
        system_instruction=system_instruction,
    )
    response = await _call_gemini(
        client.aio.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt, config=config)
    )
    return _parse_json(response.text)


async def analyze_image(
    image_bytes: bytes,
    prompt: str,
    mime_type: str = "image/png",
) -> str:
    client = _get_client()
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    response = await _call_gemini(
        client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(temperature=0.3, max_output_tokens=4096),
        )
    )
    return response.text


async def generate_embedding(text: str) -> list[float]:
    client = _get_client()
    response = await _call_gemini(
        client.aio.models.embed_content(model=settings.GEMINI_EMBEDDING_MODEL, contents=text)
    )
    return response.embeddings[0].values


# ---------------------------------------------------------------------------
# Dynamic AI Invention Interview (spec section 9)
# ---------------------------------------------------------------------------

INTERVIEW_SYSTEM_PROMPT = """You are Agent 1 (Inventor Interviewer) and Agent 2 \
(Technical Analyst) in an AI patent-preparation platform. You interview an \
inventor about their invention in a warm, plain-English, non-legalistic way \
— never a fixed questionnaire, always follow up on what is actually missing.

Core topics you must eventually cover (do not ask them all at once; ask 1-3 \
focused follow-up questions per turn, prioritizing whatever is most \
incomplete):
what the invention is; what problem it solves; how it works; its components \
and their relationships; sequence of operation; alternatives; what is \
essential vs optional; what makes it different from existing solutions; who \
contributed and what each human contributed; when it was conceived; whether \
it was publicly disclosed, offered for sale, sold, published, or demonstrated \
(and when/where); whether prototypes or drawings exist; whether AI tools were \
used in conceiving it.

Rules (non-negotiable):
- Never invent technical facts the inventor did not state or clearly imply.
- If you infer or suggest something the inventor did not explicitly say \
  (e.g. a likely variation or an implied feature), you MUST phrase it back as \
  a question for confirmation, e.g. "This sounds like it might also work with \
  X — is that part of your invention, or should I not include it?" and tag it \
  as AI_SUGGESTED, not USER_PROVIDED.
- Only tag a fact USER_PROVIDED if the inventor stated it themselves in this \
  conversation.
- AI is never listed as an inventor.
- Keep replies concise and conversational.

Respond ONLY with a JSON object of this exact shape:
{
  "reply": "<your next message to the inventor>",
  "record_patch": {
    "<topic_key>": [
      {"value": "<short factual statement>", "provenance": "USER_PROVIDED|AI_SUGGESTED|AI_INFERRED", "confirmed": <true only if provenance is USER_PROVIDED>}
    ]
  },
  "problem_solved_patch": "<updated 1-2 sentence problem statement, or null if unchanged>",
  "short_summary_patch": "<updated 2-4 sentence plain-English summary of the invention, or null if unchanged>",
  "technical_field_patch": "<short technical field label, or null if unchanged>",
  "inventor_mentions": [{"full_name": "<name if a contributor was newly named>", "contribution_description": "<what they said this person contributed>"}],
  "disclosure_flags": [{"disclosure_type": "public_disclosure|sale|offer_for_sale|publication|presentation|demonstration", "note": "<what was said>"}],
  "missing_topics": ["<topic names still needing coverage>"],
  "interview_status": "INCOMPLETE|NEEDS_CLARIFICATION|READY_FOR_PROVISIONAL_DRAFT"
}

Valid topic_key values for record_patch: components, functions, connections, \
process_workflow, inputs, outputs, materials, software_hardware, \
configurations, use_cases, alternative_embodiments, optional_features, \
variations, known_prototypes, technical_limitations, advantages.

Only set interview_status to READY_FOR_PROVISIONAL_DRAFT once the core topics \
above are reasonably covered with concrete detail — not after one or two \
messages."""


async def run_interview_turn(
    history: list[dict],
    structured_record: dict,
    missing_topics: list[str],
) -> dict:
    payload = {
        "conversation_history": history,
        "current_structured_record": structured_record,
        "topics_not_yet_covered": missing_topics,
    }
    return await _generate_json(
        prompt=json.dumps(payload, ensure_ascii=False),
        system_instruction=INTERVIEW_SYSTEM_PROMPT,
        temperature=0.4,
        max_tokens=4096,
    )


# ---------------------------------------------------------------------------
# Provisional Drafting Agent (spec section 13)
# ---------------------------------------------------------------------------

PROVISIONAL_DRAFTING_SYSTEM_PROMPT = """You are Agent 3 (Provisional \
Specialist) and Agent 6 (Specification Writer) in an AI patent-preparation \
platform. Draft a U.S. provisional patent application specification using \
ONLY the facts provided in the invention record below — never invent \
components, capabilities, prior art, or advantages that are not present or \
clearly implied in the record.

If the record lacks sufficient detail for a section, write the section as \
completely as the facts allow and explicitly note in that section's text, in \
brackets, what additional detail the inventor should supply, e.g. \
"[Additional detail needed: specify the sensor type.]" — never pad with \
generic filler to look complete.

Do not include any statement asserting the invention is patentable, novel, \
or non-obvious over the prior art — that determination is not yours to make.

Claims are not required in a provisional application. You may draft internal \
Draft Claims to help surface gaps in the description, but they must never be \
represented as a filing requirement.

Respond ONLY with a JSON object mapping each of these section keys to its \
drafted text (plain text, no markdown headers):
title, short_summary, technical_field, background, summary_of_invention, \
brief_description_of_drawings, detailed_description, alternative_embodiments, \
examples_use_cases, draft_claims"""


async def draft_provisional_sections(
    structured_record: dict,
    interview_transcript: list[dict],
    inventors: list[dict],
    title: str,
    problem_solved: str | None,
    technical_field: str | None,
) -> dict:
    payload = {
        "title": title,
        "problem_solved": problem_solved,
        "technical_field": technical_field,
        "structured_record": structured_record,
        "inventors": inventors,
        "interview_transcript": interview_transcript,
    }
    return await _generate_json(
        prompt=json.dumps(payload, ensure_ascii=False),
        system_instruction=PROVISIONAL_DRAFTING_SYSTEM_PROMPT,
        temperature=0.5,
        max_tokens=16384,
    )


# ---------------------------------------------------------------------------
# Legacy / Phase-2 helpers (kept for future Claims/Prior-Art/Office-Action work)
# ---------------------------------------------------------------------------


async def classify_patent(description: str) -> dict:
    system = (
        "You are a USPTO patent classification expert. "
        "Analyze the invention description and return JSON with: "
        "patent_type (utility/design/plant), "
        "cpc_codes (list of likely CPC classification codes), "
        "technology_domain (string), "
        "confidence (0-1 float)."
    )
    return await _generate_json(prompt=description, system_instruction=system, temperature=0.2)


async def draft_patent_section(
    section: str,
    invention_description: str,
    patent_type: str,
    prior_art_context: str = "",
    additional_instructions: str = "",
) -> str:
    system = (
        "You are a patent drafting expert specialized in USPTO applications. "
        "Draft patent documents in formal USPTO language. "
        "Never make prior art admissions that could limit claim scope. "
        "Use enabling language throughout. Follow 37 CFR Part 1 requirements."
    )
    prompt = (
        f"Patent Type: {patent_type}\n"
        f"Section to Draft: {section}\n"
        f"Invention Description:\n{invention_description}\n"
    )
    if prior_art_context:
        prompt += f"\nPrior Art Context:\n{prior_art_context}\n"
    if additional_instructions:
        prompt += f"\nAdditional Instructions:\n{additional_instructions}\n"

    return await generate_text(
        prompt=prompt,
        system_instruction=system,
        temperature=0.5,
        max_tokens=16384,
    )


async def check_drawing_compliance(image_bytes: bytes, mime_type: str = "image/png") -> dict:
    prompt = (
        "Analyze this patent drawing for USPTO compliance per 37 CFR § 1.84. Check:\n"
        "1. Black and white line quality (no color, no grayscale shading)\n"
        "2. Clear solid lines with consistent weight\n"
        "3. Proper margins and scale\n"
        "4. Reference numerals visible and consistent\n"
        "5. View type identification (perspective, front, back, left, right, top, bottom)\n\n"
        "Return JSON with: compliant (bool), view_type (string), "
        "issues (list of strings), suggestions (list of strings)."
    )
    result = await analyze_image(image_bytes, prompt, mime_type)
    return _parse_json(result)


async def analyze_office_action(office_action_text: str, application_context: str) -> dict:
    system = (
        "You are a patent prosecution expert. Analyze the USPTO office action "
        "and provide a strategic response plan."
    )
    prompt = (
        f"Office Action:\n{office_action_text}\n\n"
        f"Application Context:\n{application_context}\n\n"
        "Provide JSON with: rejections (list of {type, claims, basis, explanation}), "
        "recommended_actions (list of strings), "
        "response_draft (string with suggested arguments), "
        "deadline_days (int, typically 3 months = 90 days)."
    )
    return await _generate_json(prompt=prompt, system_instruction=system, temperature=0.3, max_tokens=16384)
