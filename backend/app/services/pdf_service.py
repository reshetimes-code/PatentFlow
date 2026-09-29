import io

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak

SECTION_TITLES = {
    "title": "Title of the Invention",
    "short_summary": "Short Summary",
    "technical_field": "Technical Field",
    "background": "Background",
    "summary_of_invention": "Summary of the Invention",
    "brief_description_of_drawings": "Brief Description of the Drawings",
    "detailed_description": "Detailed Description",
    "alternative_embodiments": "Alternative Embodiments",
    "examples_use_cases": "Examples / Use Cases",
    "draft_claims": "Internal Draft Claims (NOT required for provisional filing)",
}

SECTION_ORDER = list(SECTION_TITLES.keys())


def render_provisional_pdf(
    invention_title: str,
    inventors: list[str],
    sections: dict[str, str],
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        topMargin=1 * inch,
        bottomMargin=1 * inch,
        leftMargin=1 * inch,
        rightMargin=1 * inch,
        title=f"Provisional Application Draft — {invention_title}",
    )
    styles = getSampleStyleSheet()
    heading = ParagraphStyle("SectionHeading", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body = ParagraphStyle("Body", parent=styles["BodyText"], leading=15)

    story = [
        Paragraph(invention_title or "Untitled Invention", styles["Title"]),
        Paragraph(
            "Provisional Patent Application — Draft (not yet filed unless a filing date is recorded)",
            styles["Italic"],
        ),
        Spacer(1, 0.15 * inch),
        Paragraph("Inventor(s): " + (", ".join(inventors) if inventors else "Not yet confirmed"), body),
        Spacer(1, 0.25 * inch),
    ]

    for key in SECTION_ORDER:
        content = (sections.get(key) or "").strip()
        if not content:
            continue
        story.append(Paragraph(SECTION_TITLES[key], heading))
        for paragraph in content.split("\n\n"):
            clean = paragraph.replace("\n", "<br/>").strip()
            if clean:
                story.append(Paragraph(clean, body))
                story.append(Spacer(1, 0.08 * inch))

    story.append(PageBreak())
    story.append(
        Paragraph(
            "This document was prepared with AI assistance and has not been reviewed by a "
            "registered patent attorney or agent. It is not legal advice. Review carefully "
            "before relying on it for any filing.",
            styles["Italic"],
        )
    )

    doc.build(story)
    return buffer.getvalue()
