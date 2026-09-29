# PATENTFLOW - Full Development Master Spec

## 1. Executive Summary & Vision

PatentFlow is a web-based SaaS platform that dramatically reduces or eliminates the need for expensive patent attorneys. Law firms charge $8,000–$25,000+ for utility patents and $2,000–$5,000 for design patents. PatentFlow targets 70–85% savings by guiding inventors through every step — from disclosure through USPTO submission — using AI-assisted drafting, automated prior art search, and direct USPTO Patent Center integration.

**Reference Patents Used:** US Design Patent D880,093 S ('Trocar Port Cleaning Device', Hoftman, filed Jul 28 2017, granted Mar 31 2020) and US Design Patent D723,689 S ('Surgical Scissors', George, 2015). These demonstrate the exact USPTO structure PatentFlow must generate.

### Core Value Propositions

| Value Proposition | Description |
|---|---|
| Cost Reduction | From $10,000+ down to under $2,000 — automate drafting, search, and filing |
| Guided Wizard | Step-by-step workflow for inventors with no legal background |
| AI-Assisted Drafting | LLMs generate specification, claims, and abstract from plain-English description |
| Automated Prior Art Search | USPTO PPUBS, Google Patents (87M+ patents), EPO Espacenet |
| Compliance Enforcement | Real-time validation: 37 CFR Part 1, MPEP, USPTO form requirements |
| Direct E-Filing | Submit directly to USPTO Patent Center via secure API |

### Platform Requirements
- **Target Market:** United States (USPTO-focused)
- **Languages:** English + Hebrew (full RTL/LTR support, i18n from day one)
- **Design:** Premium, high-end, impressive professional visuals
- **Performance:** Extremely fast — code splitting, lazy loading, optimized images, no sluggishness
- **Notifications:** SweetAlert2 for all messages, confirmations, and alerts
- **Entry Point:** Landing/marketing page with full platform explanation before auth

---

## 2. Patent Types Overview (USPTO)

### 2.1 Utility Patents
Protect how an invention works — any new and useful process, machine, article of manufacture, or composition of matter. Most common and valuable patent type. Term: 20 years from nonprovisional filing date, subject to maintenance fees at 3.5, 7.5, and 11.5 years.

- **Requires:** Specification (all sections), Claims (independent + dependent), Abstract, Drawings
- **Filing fees (2025/2026):** ~$1,850 total (micro); ~$3,700 (small); ~$7,400+ (large) — including search, examination, and issue fees
- **Examination timeline:** Average 22–30 months to first office action

### 2.2 Design Patents
Protect the ornamental (visual) appearance of a functional article — its shape, configuration, or surface ornamentation. Contain only one claim and rely primarily on drawings. Note: The Rocket Docket expedited program was eliminated August 14, 2025.

- **Term:** 15 years from grant date (for apps filed after May 13, 2015)
- **Single claim:** 'The ornamental design for [article], as shown and described.'
- **Requires:** All standard drawing views — front, back, left, right, top, bottom, perspective
- **No maintenance fees required**
- **Fees (2025/2026):** ~$1,300 total (large); ~$520 (small); ~$260 (micro)

### 2.3 Provisional vs. Nonprovisional

| Feature | Provisional | Nonprovisional |
|---|---|---|
| Examined? | No — auto-abandoned after 12 months | Yes — full USPTO examination |
| Cost | $64–$320 (filing fee only) | $400–$3,500+ (filing + search + exam) |
| Term | 12 months, then abandoned | 20 years from filing (utility) |
| Claims required? | No | Yes — mandatory |
| Purpose | Establishes priority date; buys 12 months | Actual patent application |
| Patent Pending? | Yes, immediately | Yes, during examination |

---

## 3. US Patent Document Structure

### 3.1 Utility Patent Application — Required Sections

| # | Section | Description / Logic |
|---|---|---|
| 1 | Title | 2–7 words, descriptive, max 500 chars. No articles ('a', 'an', 'the'). Example: 'Trocar Port Cleaning Device' |
| 2 | Cross-References | Required if claiming priority from provisional, CIP, or continuation. Cite application number(s), filing date(s), relationship |
| 3 | Background | Field of invention + problems with existing solutions. 1–3 paragraphs. Avoid admissions of prior art that could limit claim scope |
| 4 | Brief Summary | Concise statement of the invention. Must parallel broadest independent claim without using claims language |
| 5 | Figure Descriptions | One line per figure: 'FIG. 1 is a perspective view of the device of the present invention; FIG. 2 is a front elevational view thereof.' |
| 6 | Detailed Description | Complete enabling description referencing every numbered element in every figure. POSITA must be able to reproduce invention. 10–30+ pages for complex inventions |
| 7 | Claims | Legal scope of protection. Up to 20 total (3 independent) in base fee. Each claim is one sentence. Must be supported by specification |
| 8 | Abstract | Max 150 words. Technical summary for public and examiners. Mention key novel features. No claim language |
| 9 | Seq/Code Appendix | Biotech (ST.26 XML) or software (large code). Submitted separately. Not required for most mechanical/design patents |

### 3.2 Design Patent Sections (Reference: D880,093 S and D723,689 S)

| # | Section | Description / Logic |
|---|---|---|
| 1 | Title/Subject | Article name: e.g., 'TROCAR PORT CLEANING DEVICE' |
| 2 | Applicant/Inventor Info | Inventor legal name, city, state, country. Assignee. Application number. Filing date. LOC, USPC, CPC classification codes |
| 3 | References Cited | All prior U.S. patents, foreign patents, and publications — examiner-added and applicant-disclosed |
| 4 | Single Claim | Exactly one claim: 'The ornamental design for [ARTICLE], as shown and described.' |
| 5 | Description of Views | 'FIG. 1 is a perspective view; FIG. 2 is a front view; FIG. 3 is a back view; FIG. 4 is a right side view; FIG. 5 is a left side view; FIG. 6 is a top view; FIG. 7 is a bottom view thereof.' |
| 6 | Drawing Sheets | B&W line drawings per 37 CFR § 1.84. Correct margins, line weight, sheet labels (Sheet X of Y), inventor name, figure numbers. Typically 4–7 sheets |

---

## 4. Master Algorithm — 10 Phases

PatentFlow consists of 10 sequential phases, each a discrete module. Users progress forward but may return to revise earlier sections. AI assistance is available throughout every phase.

### Phase 1: User Onboarding & Identity Verification

| # | Step | Description / Logic |
|---|---|---|
| 1.1 | Registration | Full legal name, email, phone, country. Email OTP verification. Generate user UUID. Encrypt credentials |
| 1.2 | KYC Verify | SSN last 4 OR passport (foreign). Validate via KYC API (Persona/Jumio). Assign role: inventor / applicant / assignee |
| 1.3 | Entity Size | CRITICAL for fee calculation. Questionnaire: Is applicant a person, small business (<500 employees), or large corporation? Has any rights been assigned to a large entity? Result: Large / Small Entity (50% fee discount) / Micro Entity (80% discount, income threshold applies). Store entity_type |
| 1.4 | Inventor Profile | Legal name, citizenship, residence address (required for oath/declaration). Multiple co-inventors allowed — each must sign declaration. Store co-inventor relationships |
| 1.5 | Attorney Question | Pro se (self-filing) or registered patent attorney/agent? If attorney: collect USPTO reg number, validate via roster API. If pro se: show disclaimer about complexity |
| 1.6 | Dashboard Init | Create user workspace. Initialize application record (status=DRAFT). Display onboarding checklist. Show estimated total cost based on entity type |

### Phase 2: Invention Disclosure Intake

| # | Step | Description / Logic |
|---|---|---|
| 2.1 | Invention Title | 'What do you call your invention? (2–7 words).' Validate length, no articles. AI suggests 3 alternatives |
| 2.2 | Plain Description | Open text: 'Describe your invention — what it is, what it does, why it's better than existing solutions.' Min 100 words. AI parses key technical elements |
| 2.3 | Problem Being Solved | 'What problem does your invention solve? What are the shortcomings of current solutions?' Maps to Background section |
| 2.4 | How It Works | Step-by-step operation. Physical: materials, components. Software: process flow. Chemical: composition and method. Maps to Detailed Description |
| 2.5 | Key Novel Features | List 3–10 unique features. Each becomes potential independent or dependent claim element. AI suggests patent claim language |
| 2.6 | Preferred Embodiment | Best/preferred version. Additional variations as alternative embodiments — each may become a dependent claim |
| 2.7 | Filing Type | Gate: (a) Provisional application first? or (b) Direct Nonprovisional? Set application_type flag |

### Phase 3: Patent Type Classifier

| # | Step | Description / Logic |
|---|---|---|
| 3.1 | AI Classification | LLM classifier: (A) Utility — protects function/process, (B) Design — ornamental only, (C) Both. Returns: classification + confidence score + rationale |
| 3.2 | User Confirmation | Present AI recommendation with explanation. Allow override. Show comparison table. Warn if wrong type detected |
| 3.3 | Branch Routing | IF Design: single-claim workflow, drawings-first. IF Utility: full specification + multi-claim. IF Both: create two linked application records |
| 3.4 | CPC Classification | AI suggests CPC codes for examiner routing and prior art targeting. Store: suggested_cpc_codes[] in application record |
| 3.5 | Technology Domain | Mechanical / Electrical / Software / Chemical / Biological / Medical Device / Consumer Product. Affects AI templates and claim conventions |

### Phase 4: Prior Art Search Engine

| # | Step | Description / Logic |
|---|---|---|
| 4.1 | Keyword Extraction | AI extracts 5–15 key technical terms + synonyms + CPC codes from invention description |
| 4.2 | USPTO PPUBS Search | API call: Full-text search (Title, Abstract, Claims) + classification search. Issued patents + published apps 2001+. Top 50 results |
| 4.3 | Google Patents Search | Google Patents API — 87M+ patents worldwide. Also run Prior Art Finder across Google Scholar, Google Books, and web. Tag results by source |
| 4.4 | EPO Espacenet | EPO Open Patent Services OPS API for international prior art (EP, WO/PCT, DE, JP, CN). Understand global landscape even for US-only filing |
| 4.5 | AI Relevance Scoring | LLM evaluates each patent: technical similarity score (0–100), claims overlap, date analysis (is it prior art?), classification overlap. Rank: High/Medium/Low |
| 4.6 | Novelty Gap Analysis | AI compares user invention vs. prior art. Output: feature-by-feature matrix, novelty gaps, obviousness risks (103), claim differentiation recommendations |
| 4.7 | Prior Art Report | PDF: top 10–20 most relevant patents, why user's invention is novel, suggested claim language to avoid prior art, warning flags if novelty is questionable |
| 4.8 | IDS Auto-Generation | Auto-populate Form PTO/SB/08 (Information Disclosure Statement). All material prior art MUST be disclosed. Duty of candor — failure can render patent unenforceable |

### Phase 5: AI Document Drafting Engine

| # | Step | Description / Logic |
|---|---|---|
| 5.1 | System Prompt Build | Detailed LLM prompt: invention disclosure + patent type + technology domain + prior art context + drafting instructions (USPTO format, no prior art admissions, enabling language). Use Google Gemini 2.5 Pro (1M context) |
| 5.2 | Generate Title | AI generates 3–5 alternatives. User selects or types custom. Validate: 2–7 words, max 500 chars, no articles |
| 5.3 | Generate Abstract | Max 150 words enforced. Plain technical language. Key novel features highlighted. Rich text editor with live word counter |
| 5.4 | Generate Background | From problem description + prior art context. AI avoids statements admitting prior art weakness that could limit claim scope |
| 5.5 | Generate Summary | Parallels broadest independent claim without claims language. Design patents: describes ornamental aspects visible in the drawings |
| 5.6 | Generate Figure Descriptions | Per uploaded figure: 'FIG. 1 is a perspective view of the [device]; FIG. 2 is a front elevational view thereof.' Auto-detect view type from image analysis |
| 5.7 | Generate Detailed Description | Paragraph-by-paragraph description referencing each numbered element. Structure: Introduction → Component descriptions → Operation → Alternative Embodiments. User can request AI expansion of any section |

### Phase 6: Claims Engineering Module

| # | Step | Description / Logic |
|---|---|---|
| 6.1 | Design Auto-Claim | IF design: auto-generate 'The ornamental design for [TITLE], as shown and described.' Skip to Phase 7 |
| 6.2 | Claim Strategy | Wizard: independent = broadest protection (fewer elements = broader scope); dependent = fallback + licensable sub-features. Fee alert: >3 independent = $600 surcharge each; >20 total = $200 surcharge each |
| 6.3 | Independent Claim | AI drafts Claim 1 (broadest). Format: [Preamble] comprising: [element 1]; [element 2]; wherein [distinguishing feature]. Uses 'comprising' (open). Validates no means-plus-function traps |
| 6.4 | Dependent Claims | AI generates 15–19 dependent claims. Strategy: critical features 2–5, embodiments 6–12, specific materials/dimensions 13–19. Drag-and-drop claim reordering |
| 6.5 | Claims Validator | Real-time: (1) single sentence, (2) no new matter, (3) proper dependency references, (4) no indefinite language, (5) no improper plural dependent claims. Color-coded status |
| 6.6 | Prior Art Clearance | Run each independent claim through patent search. Flag 102 (anticipation) or 103 (obviousness) risks. Suggest amendments to differentiate |
| 6.7 | Claims Summary | Count summary with fee calculation. Allow user to consolidate claims to reduce USPTO surcharges |

### Phase 7: Drawings & Figures Module

| # | Step | Description / Logic |
|---|---|---|
| 7.1 | Drawing Upload | Drag-and-drop: JPEG, PNG, PDF, SVG, TIF. Multiple files. Auto-assign FIG. numbers. Reorderable. Store in AWS S3 |
| 7.2 | Compliance Check | AI vision analysis: (a) paper size, (b) margins (top/right 2.5cm, left 3.8cm, bottom 1.0cm), (c) line weight — solid black required, (d) color detection — B&W required unless petition filed, (e) resolution ≥300 DPI |
| 7.3 | Reference Numerals | UI: assign reference numerals to components. Consistency check: same component = same numeral across all figures. Auto-generate component glossary |
| 7.4 | View Classification | Classify each figure: Perspective, Front, Back, Left, Right, Top, Bottom, Cross-section, Detail, Exploded, Schematic. Design patents need all standard views — AI flags missing |
| 7.5 | AI Drawing Generation | Optional: AI generates B&W patent-style line drawings from description. User reviews and approves. Recommend professional draftsman verification for final submission |
| 7.6 | Final Standards Check | Verify: no photographs (unless petition), reference numeral font ≥0.32cm, lead lines don't cross, each sheet labeled 'Sheet X of Y' with inventor name and figure numbers |
| 7.7 | Drawing PDF Assembly | Compile all approved drawings into multi-sheet PDF in USPTO format. Validate final PDF. Export for USPTO submission separately from specification |

### Phase 8: Document Assembly & Compliance Review

| # | Step | Description / Logic |
|---|---|---|
| 8.1 | Assembly | Correct USPTO order: (1) ADS [PTO/SB/14], (2) Specification (Title, Cross-Refs, Background, Summary, Figure Descriptions, Detailed Description, Claims, Abstract), (3) Drawings PDF, (4) Oath/Declaration [AIA PTO/AIA/01], (5) IDS [PTO/SB/08], (6) Fee Transmittal [PTO/SB/17]. Output: DOCX + PDF |
| 8.2 | Completeness Check | Validate: all sections present and non-empty, abstract ≤150 words, all figures referenced in Detailed Description, all reference numerals match drawings, no duplicate sections, claims supported by specification |
| 8.3 | Format Validation | DOCX: margins (top/right 1.5cm, left 2.5cm), Courier or Times 12pt, 1.5/double line spacing, page numbers, 8.5x11 paper. 2025 requirement: nonprovisional utility apps must be filed in DOCX format |
| 8.4 | Legal Scan | AI scans: (a) indefinite language ('about', 'approximately', 'substantially' — warn unless defined), (b) new matter in claims vs. spec, (c) 35 USC 112 violations, (d) prior art admissions limiting claim scope |
| 8.5 | Quality Score | Score 0–100: specification completeness, claims breadth/defensibility, prior art differentiation, drawing compliance, technical clarity. Report card with actionable improvements |
| 8.6 | Attorney Review Option | Optional flat-fee attorney review. Partner attorney annotates in-app. Attorney-client privilege maintained for reviewed portions |
| 8.7 | Final Review | Tabbed interface for complete application review. Click any section to jump and edit. 'Mark as Final' locks document. Explicit user confirmation required for each section |

### Phase 9: USPTO Filing Integration

| # | Step | Description / Logic |
|---|---|---|
| 9.1 | USPTO Account | OAuth 2.0 with USPTO Patent Center. Verify: eFiler registration, 2FA set up, Customer Number assigned. Support both user's own account and registered agent account |
| 9.2 | Fee Calculation | Calculate exact fees: basic filing + search + examination (by entity type), excess claim surcharges, pages-over-100, non-electronic surcharge (avoided by e-filing). Show total before payment. Accept: credit card (Stripe), USPTO Deposit Account |
| 9.3 | ADS Generation | Auto-populate Form PTO/SB/14: inventor names/addresses/citizenship, application type, title, priority claims, assignee, attorney info. Output: completed DOCX for upload |
| 9.4 | DOCX Prep | Validate specification DOCX: correct styles, no tracked changes, no comments, no embedded images in spec body. Convert if needed. New 2025 requirement: nonprovisional utility apps in DOCX |
| 9.5 | Pre-Submission Checklist | Final automated checklist: ADS complete, Specification DOCX, Drawings PDF (separate), Declaration signed, IDS submitted, Fee authorized, Receipt email configured |
| 9.6 | Patent Center Submit | Submit via USPTO Patent Center API: upload all documents, submit fee, confirm. Capture: application number, filing date, receipt number. Send email confirmation |
| 9.7 | Filing Receipt | Parse receipt: extract application number (e.g., 29/612,103), official filing date. Store receipt PDF. Calculate all downstream deadlines: 12-month provisional deadline, PCT deadline, expected exam date |

### Phase 10: Application Tracking & Post-Filing Management

| # | Step | Description / Logic |
|---|---|---|
| 10.1 | Status Monitor | Poll USPTO Patent Center API daily. Alert via email + in-app: new correspondence, office action, allowance/rejection, deadlines (30/60/90 day warnings) |
| 10.2 | Office Action Analysis | AI reads rejections: 102 (anticipation), 103 (obviousness), 112 (specification issues), 101 (patent eligibility for software/biotech). Plain-English summary of examiner's objections |
| 10.3 | Response Drafting | For 102/103: suggest claim amendments + written arguments distinguishing prior art. For 112: spec amendments. For drawing objections: correction guide. Track deadline + extension costs |
| 10.4 | RCE & Continuations | Alert when RCE is available. Track continuation/divisional/CIP opportunities. Remind of PCT deadline (12 months from priority) for international protection |
| 10.5 | Patent Grant | On allowance: calculate issue fee, generate payment reminder. After grant: display patent number, maintenance fee calendar (utility: 3.5/7.5/11.5 years), generate certificate PDF. Note: design patents have NO maintenance fees |
| 10.6 | Portfolio Dashboard | All applications + status, key deadlines calendar, fee payment schedule, prior art portfolio, assignee/licensing tracking. Export portfolio summary report |

---

## 5. Application Architecture

### 5.1 System Layers

| Layer | Component | Recommended Technology |
|---|---|---|
| Frontend | User Interface / Wizard | React.js + TypeScript + Next.js 15, TailwindCSS, Shadcn/UI |
| Frontend | Rich Text Editor | TipTap (ProseMirror-based) — custom patent document schemas |
| Frontend | Drawing Annotation | Konva.js or Fabric.js for figure reference numeral overlays |
| API Gateway | REST API | FastAPI (Python 3.12) — async, auto-docs, AI integration |
| AI / LLM | Patent Drafting | Google Gemini 2.5 Pro (1M context window) |
| AI / LLM | Drawing Analysis | Google Gemini 2.5 Pro Vision (multimodal, built-in) |
| AI / LLM | Classification | Google Gemini 2.5 Pro + CPC code prediction |
| Search Layer | Patent Search Aggregator | Custom service: USPTO PPUBS + Google Patents + EPO OPS APIs |
| Search Layer | Semantic Patent Search | Gemini text-embedding-004 + PostgreSQL pgvector |
| Document Engine | DOCX Generation | python-docx + DOCX templates per patent type |
| Document Engine | PDF Output | ReportLab (Python) for user-facing formatted documents |
| Primary Database | Relational Store | PostgreSQL 16 + pgvector (relational + vector similarity) |
| Document Store | Draft Versioning | MongoDB Atlas (flexible schema for evolving patent drafts) |
| File Storage | Drawings, PDFs, DOCX | AWS S3 — versioning, encryption, per-user isolation |
| Authentication | User Auth + MFA | Auth0 — OAuth 2.0, FIDO2/WebAuthn, USPTO OAuth linking |
| Payments | Fee Collection | Stripe — PCI-compliant, subscriptions + one-time USPTO fees |
| E-Signature | Declaration Forms | DocuSign — UETA/ESIGN compliant, USPTO-acceptable |
| Cloud Hosting | Infrastructure | AWS ECS/Fargate (backend) + Vercel (frontend) |
| Monitoring | Observability | Datadog — metrics, logs, traces, USPTO API latency alerts |

### 5.2 Data Flow

1. User Input (Invention Description + Drawings)
2. Intake Module → PostgreSQL (applications table)
3. AI Classifier → Determine patent_type, technology_domain, cpc_codes
4. Search Service → USPTO PPUBS + Google Patents + EPO APIs → prior_art table
5. LLM Drafting Engine (Gemini API) → Generate spec sections → documents table
6. Claims Engine → Validate → claims table
7. Drawing Processor → S3 → Compliance check → figures table
8. Assembly Engine → Generate DOCX + PDF → Compliance audit
9. USPTO Patent Center API → Filing receipt → Confirmation stored
10. Daily Status Monitor → Alert system → Response drafting assistant

---

## 6. Technology Stack (Full)

| Category | Technology | Justification |
|---|---|---|
| Frontend Framework | React.js + TypeScript + Next.js 15 | SSR/SEO, type safety, large ecosystem |
| UI Components | Shadcn/UI + TailwindCSS | Accessible, customizable, patent form components |
| State Management | TanStack Query + Zustand | Server state + client state separation |
| Rich Text Editor | TipTap (ProseMirror) | Custom patent schemas, track changes, collaborative editing |
| Notifications | SweetAlert2 | Premium alert/confirmation/notification dialogs |
| Animations | Framer Motion | Smooth page transitions, micro-interactions |
| Backend API | FastAPI (Python 3.12) | Async, AI integration, auto API docs |
| Task Queue | Celery + Redis | Background AI processing, patent search jobs |
| AI / LLM | Google Gemini 2.5 Pro | Long-form technical writing + vision, 1M context, cost-effective |
| Document — DOCX | python-docx | USPTO-compliant DOCX with styles and templates |
| Document — PDF | ReportLab (Python) | Professional patent-formatted PDF output |
| Primary Database | PostgreSQL 16 + pgvector | Relational data + vector similarity in one DB |
| Document Store | MongoDB Atlas | Flexible schema for patent draft versions |
| File Storage | AWS S3 | Reliable, versioning, encryption at rest |
| Vector Search | Gemini text-embedding-004 + pgvector | Semantic patent similarity for prior art search (in-DB) |
| Authentication | Auth0 | Enterprise MFA, FIDO2, USPTO OAuth linking |
| Payments | Stripe | PCI-compliant, subscriptions + one-time USPTO fees |
| E-Signature | DocuSign API | UETA/ESIGN compliant, USPTO-acceptable, audit trail |
| KYC | Persona / Jumio | Identity verification, document scan, liveness check |
| Email | SendGrid | Transactional email — deadlines, alerts, templates |
| Cloud Platform | AWS (primary) | SOC 2, HIPAA-eligible, global regions |
| CI/CD | GitHub Actions + AWS CodeDeploy | Automated tests, security scan, blue-green deploy |
| Monitoring | Datadog | Full-stack observability, USPTO API latency, alerts |
| i18n | next-intl | Bilingual EN/HE, RTL/LTR support |

---

## 7. Database Schema (PostgreSQL)

### Table: users
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
full_name VARCHAR(255)
entity_type VARCHAR(10) -- 'large','small','micro'
is_attorney BOOLEAN DEFAULT false
attorney_reg_number VARCHAR(50)
citizenship VARCHAR(100)
address JSONB
kyc_verified BOOLEAN DEFAULT false
```

### Table: applications
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
title VARCHAR(500)
patent_type VARCHAR(20) -- 'utility','design','plant','provisional'
technology_domain VARCHAR(100)
suggested_cpc_codes TEXT[]
status VARCHAR(20) -- 'draft','reviewing','filed','pending','allowed','granted','abandoned'
application_number VARCHAR(20) -- USPTO assigned after filing
filing_date DATE
entity_type VARCHAR(10)
total_claims INT DEFAULT 0
independent_claims INT DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Table: specification_sections
```sql
id UUID PRIMARY KEY
application_id UUID REFERENCES applications(id)
section_type VARCHAR(50) -- 'title','background','summary','figure_descriptions',
                         -- 'detailed_description','claims','abstract','cross_references'
content TEXT
ai_generated_at TIMESTAMP
user_approved_at TIMESTAMP
word_count INT
version INT DEFAULT 1
```

### Table: claims
```sql
id UUID PRIMARY KEY
application_id UUID REFERENCES applications(id)
claim_number INT NOT NULL
claim_type VARCHAR(15) -- 'independent','dependent'
depends_on INT -- references claim_number for dependent claims
claim_text TEXT NOT NULL
validation_status VARCHAR(10) -- 'valid','warning','error'
validation_notes TEXT
```

### Table: prior_art
```sql
id UUID PRIMARY KEY
application_id UUID REFERENCES applications(id)
patent_number VARCHAR(30)
title VARCHAR(500)
inventors TEXT
assignee VARCHAR(255)
filing_date DATE
grant_date DATE
source VARCHAR(20) -- 'uspto','google_patents','espacenet','other'
relevance_score INT
relevance_notes TEXT
cited_in_ids BOOLEAN DEFAULT false
```

### Table: figures
```sql
id UUID PRIMARY KEY
application_id UUID REFERENCES applications(id)
figure_number INT
view_type VARCHAR(20) -- 'perspective','front','back','left','right','top','bottom'
s3_url VARCHAR(500)
file_format VARCHAR(10)
resolution_dpi INT
compliance_status VARCHAR(10) -- 'pass','warning','fail'
caption TEXT
```

### Table: office_actions
```sql
id UUID PRIMARY KEY
application_id UUID REFERENCES applications(id)
action_date DATE
response_deadline DATE
rejection_types TEXT[] -- ['102','103','112','101']
ai_analysis TEXT
ai_draft_response TEXT
response_filed_at TIMESTAMP
```

---

## 8. API Integrations

| API / Service | Purpose | Auth | Key Notes |
|---|---|---|---|
| USPTO Patent Public Search | Prior art — all US patents 1790–present | Public API key | Full-text + classification search |
| USPTO Patent Center API | E-filing, status, document retrieval | OAuth 2.0 + USPTO account | File apps, receipts, exam status |
| Google Patents API | International — 87M+ patents | Google Cloud key | Patent metadata + Prior Art Finder |
| EPO Open Patent Services (OPS) | European + PCT international prior art | OAuth 2.0 client credentials | EP, WO, DE, JP, CN patent data |
| Google Gemini API | AI drafting, classification, OA analysis, drawing compliance | Google AI API key (gemini-2.5-pro) | 1M context, multimodal (text+vision), cost-effective single provider |
| Stripe | Payment — subscription + USPTO fees | Stripe API key + webhook | PaymentIntent, Subscription, Customer |
| Auth0 | User auth, MFA, USPTO account linking | OAuth 2.0 | Pools, tokens, MFA, FIDO2 |
| AWS S3 | Drawings, PDFs, DOCX storage | IAM role | Pre-signed URLs, versioning, isolation |
| DocuSign | E-signature on Oath/Declaration | OAuth 2.0 | Envelope routing, completion webhooks |
| KYC (Persona/Jumio) | Inventor identity verification | API key | Doc verify, liveness, ID scan |
| SendGrid | Transactional email — deadlines, alerts | API key | Templates, delivery tracking |

---

## 9. Fee Calculator Module

Fees per USPTO schedule effective January 19, 2025 (last revised May 1, 2026). Store fees in a `fees_config` database table — update quarterly from the official USPTO fee schedule PDF.

| Fee Type | Large Entity | Small Entity | Micro Entity |
|---|---|---|---|
| Provisional — Basic Filing | $320 | $128 | $64 |
| Utility — Filing | $350 | $140 | $70 |
| Utility — Search | $700 | $280 | $140 |
| Utility — Examination | $800 | $320 | $160 |
| Utility — Excess independent claim (per claim over 3) | $600 | $240 | $120 |
| Utility — Excess total claims (per claim over 20) | $200 | $80 | $40 |
| Utility — Non-electronic filing surcharge | $400 | $200 | $200 |
| Design — Filing + Search + Examination (total) | $1,300 | $520 | $260 |
| Utility — Issue Fee (upon grant) | $1,200 | $480 | $240 |
| Design — Issue Fee (upon grant) | $900 | $360 | $180 |
| Utility — Maintenance at 3.5 years | $3,200 | $1,600 | $800 |
| Utility — Maintenance at 7.5 years | $7,200 | $3,600 | $1,800 |
| Utility — Maintenance at 11.5 years | $14,800 | $7,400 | $3,700 |
| IDS — after 3 months from filing | $360 | $144 | $72 |

**Fee Calculator Formula:**
```
total_filing_fee = filing_fee + search_fee + exam_fee
  + max(0, indep_claims - 3) * excess_indep_fee
  + max(0, total_claims - 20) * excess_claim_fee
  + (non_elec_surcharge if paper_filing else 0)

Multiplier: Large=1.0x | Small=0.4x | Micro=0.2x
```

---

## 10. Security & Compliance

- **Data Encryption:** All patent content encrypted at rest (AES-256) and in transit (TLS 1.3). Patent applications are extremely sensitive, commercially valuable IP
- **Data Isolation:** Row-level security in PostgreSQL. Separate S3 prefixes per user. Users must NEVER be able to access each other's patent content. Multi-tenant security audit required before launch
- **Unauthorized Practice of Law:** Frame as 'document preparation assistance' — not legal advice. Prominent disclaimers on every page. Attorney review option for high-value applications
- **AI Audit Trail:** All AI-generated content logged: timestamp, model version, prompt hash, token count. Users can see AI-generated vs. user-written text
- **SOC 2 Type II:** Target SOC 2 certification for enterprise. Access controls, audit logging, change management, incident response
- **GDPR / CCPA:** Minimum PII collection. Data deletion on request. Cookie consent. EU data residency option planned
- **Filing Authentication:** Step-up authentication before any USPTO filing action: FIDO2/WebAuthn required. No application filed without explicit 2FA confirmation
- **E-Signature Standards:** Oath/Declaration via DocuSign — UETA/ESIGN compliant. Must meet USPTO AIA e-signature standards (37 CFR 1.4(d)(3))
- **Backup & DR:** Daily automated backups. Point-in-time recovery. RPO: 1 hour, RTO: 4 hours. Cross-region replication. Quarterly restore testing

---

## 11. Core Modules (Additional)

### AI Agent
Conversational patent creation assistant — guides users through all 10 phases interactively.

### Admin Panel
- Users management
- Billing & subscriptions
- Patents overview
- Activity Logs
- Analytics dashboard
- Support tickets

### CRM
- Leads tracking
- Opportunities pipeline
- Sales Funnel visualization
- Notes & Tasks
- Contact management

### White Label
Allow law firms and corporate IP departments to use their own branding, custom domains, and theming.

### Subscription Plans
- **Free:** 1 provisional application, basic prior art search
- **Pro:** Unlimited applications, full AI drafting, priority support
- **Business:** Team features, portfolio management, analytics
- **Enterprise:** White label, API access, dedicated support, SLA

---

## 12. Deployment

### Infrastructure
- **Frontend:** Vercel (SSR, edge functions, CDN)
- **Backend:** AWS ECS/Fargate (auto-scaling, containerized)
- **Database:** PostgreSQL 16 on AWS RDS
- **Storage:** AWS S3 (versioning, encryption)
- **Monitoring:** Datadog (full-stack observability)

### CI/CD
- GitHub Actions
- Automated tests (unit, integration, e2e)
- Security scanning
- Blue/Green Deployments via AWS CodeDeploy

---

## 13. Development Roadmap

### MVP — Months 1–3: Design Patent Focus
- User registration, KYC, entity type determination
- Invention disclosure intake — design-specific workflow
- Auto-generated single ornamental claim
- Drawing upload + 37 CFR § 1.84 compliance checking
- Prior art search — USPTO PPUBS integration
- Document assembly → PDF export
- Guided manual USPTO filing instructions (not yet automated)
- Basic fee calculator with entity type selection

### Version 1.0 — Months 4–6: Full Utility Patent Support
- Full utility patent specification drafting (all 9 sections)
- Claims engineering module (independent + dependent, real-time validation)
- AI-powered prior art analysis and novelty gap report
- IDS auto-generation (Form PTO/SB/08)
- Direct USPTO Patent Center filing API integration
- Stripe payment for USPTO fees
- Application status tracking dashboard
- DOCX format compliance (2025 USPTO requirement)

### Version 1.5 — Months 7–9: AI Enhancement + Office Actions
- Office Action AI analysis and response drafting assistant
- Attorney review marketplace integration (flat-fee)
- Collaborative editing for multiple inventors
- Provisional → Nonprovisional conversion workflow
- DocuSign e-signature for oath/declaration
- Multi-patent portfolio management dashboard
- Advanced claims strategy AI with claim tree visualization

### Version 2.0 — Months 10–12: International Expansion
- PCT (Patent Cooperation Treaty) international filing workflow
- European Patent Office (EPO) direct filing integration
- Multi-language support (Spanish, Mandarin, German, Hebrew)
- Enterprise API for law firms and corporate IP departments
- AI drawing generation from written description
- Patent portfolio analytics and estimated valuation
- White-label solution for corporate IP departments

---

## Legal Disclaimer
PatentFlow is a document preparation and filing assistance tool, not a law firm. It does not provide legal advice. For complex inventions, biotechnology, software patents, or whenever significant commercial value is at stake, consult a registered U.S. patent attorney or agent (37 CFR Part 11).

*Prepared: May 2026 | USPTO fees: effective January 19, 2025 (revised May 1, 2026) | Reference: US D880,093 S (Hoftman, 2020) and US D723,689 S (George, 2015)*
