# AI PATENT PLATFORM — MASTER BUILD SPECIFICATION
## מערכת AI להכנת Provisional Patent Application, Patent Application וניהול תהליך הפטנט

> **מטרת הקובץ:** מסמך עבודה מרכזי למתכנת/Claude/VS Code לבניית המערכת.
> המערכת חייבת להיות מודולרית, מאובטחת, עם Audit Trail מלא, ולא להסתמך על Prompt יחיד.

---

# 1. חזון המוצר

לבנות מערכת Web / PWA מבוססת AI שמאפשרת לממציא להתחיל מתיאור פשוט של רעיון ולהתקדם בצורה מודרכת עד להכנת מסמכי פטנט מסודרים.

המערכת צריכה להפוך תהליך מורכב לשיחה פשוטה:

**Inventor Idea → AI Interview → Invention Record → Provisional Patent Application → 12-Month Tracking → Full Nonprovisional Patent Application → Claims → Validation → Filing Workflow → Post-Filing Tracking**

המטרה אינה ליצור "צ'אט שכותב פטנט", אלא מערכת Production מלאה שבה:

- AI מבצע ראיון, ניתוח, מחקר, ניסוח ובקרת איכות.
- Database שומר Source of Truth.
- מנגנונים דטרמיניסטיים מנהלים סטטוסים, מסמכים, גרסאות, תאריכים והתראות.
- כל מידע שה-AI מוסיף ניתן למעקב למקור שלו.
- המשתמש מאשר במפורש כל הגשה.

---

# 2. כלל עסקי מרכזי — PROVISIONAL FIRST WORKFLOW

במסלול ברירת המחדל של המוצר עבור המצאה המתאימה לכך, המערכת תציע ותתמוך תחילה בהכנת:

## PROVISIONAL PATENT APPLICATION

לאחר מכן המערכת תנהל Countdown של עד 12 חודשים לצורך הגשת ה-Nonprovisional Patent Application המתאים כדי לבקש את benefit של מועד ההגשה המוקדם.

**חשוב:** אין להציג למשתמש כאילו Provisional הוא שלב חובה חוקי בכל מקרה. זהו מסלול אסטרטגי אפשרי, לא חובה אוניברסלית. Design inventions, לדוגמה, אינן זכאיות למסלול Provisional.

המערכת חייבת להסביר:

- Provisional הוא בקשת פטנט זמנית/ראשונית לצורך קביעת filing date מוקדם.
- הוא אינו נבחן לגופו על ידי USPTO.
- הוא אינו הופך אוטומטית לפטנט.
- תקופת ה-pendency הרגילה היא 12 חודשים.
- כדי ליהנות ממועד ההגשה של ה-Provisional, יש להגיש בזמן בקשה מתאימה שמבקשת את benefit שלו.
- Claims פורמליים אינם נדרשים ב-Provisional.
- Provisional עדיין צריך disclosure טכני מספיק; אין לבנות אותו כתקציר של כמה שורות בלבד.

---

# 3. מבנה ה-PROVISIONAL

הלקוח ביקש שהמערכת תתחיל מ:

## 3.1 Short Summary of the Invention

ה-AI ייצור תחילה תקציר ברור וקצר:

- מהי ההמצאה?
- איזו בעיה היא פותרת?
- איך היא עובדת ברמה גבוהה?
- מהם המרכיבים המרכזיים?
- מה לדעת הממציא חדש/שונה?

אבל לאחר התקציר המערכת חייבת להרחיב את התיעוד, מכיוון שה-Provisional צריך לתמוך בצורה מספקת בנושא שעליו המשתמש ירצה להסתמך מאוחר יותר.

## 3.2 Detailed Description

המערכת תאסוף:

- Components
- Functions
- Connections
- Process / workflow
- Inputs
- Outputs
- Materials
- Software/Hardware
- Configurations
- Use cases
- Alternative embodiments
- Optional features
- Variations
- Known prototypes
- Technical limitations
- Advantages

## 3.3 Drawings / Figures

כאשר ציורים נחוצים להבנת ההמצאה, המערכת תבקש/תייצר/תארגן אותם.

אפשרויות קלט:

- תמונה
- צילום אבטיפוס
- סקיצה
- CAD
- Screenshot
- Flowchart
- תרשים ידני

## 3.4 Inventor / Filing Information

יש לאסוף ולשמור:

- Inventor(s)
- Residence / required inventor information
- Invention title
- Correspondence information
- Applicant information where relevant
- Entity status
- Cover Sheet / ADS information
- Filing fee information

## 3.5 Claims in Provisional

Claims אינם חובה ב-Provisional.

המערכת יכולה לייצר Draft Claims פנימיים לצורך:

- הבנת היקף ההמצאה
- איתור חוסרים בתיאור
- הכנה עתידית ל-Nonprovisional

אך אין להציג אותם למשתמש כאילו הם דרישת חובה להגשת Provisional.

---

# 4. 12-MONTH PATENT CLOCK

מיד לאחר שהמערכת מקבלת Filing Date מאומת של Provisional, יש ליצור:

`provisional_filing_date`

`provisional_12_month_date`

`days_remaining`

`nonprovisional_status`

## Dashboard Widget

### PROVISIONAL ACTIVE

**Filed:** MM/DD/YYYY  
**12-Month Date:** MM/DD/YYYY  
**Days Remaining:** XXX

CTA:

**CONTINUE TO FULL PATENT APPLICATION**

## התראות

מנגנון ההתראות יהיה דטרמיניסטי ולא מבוסס רק על AI.

ברירת מחדל:

- 9 חודשים
- 10 חודשים
- 11 חודשים
- 30 ימים לפני
- 14 ימים לפני
- 7 ימים לפני
- 3 ימים לפני
- 1 יום לפני

Channels:

- Email
- Dashboard
- Push
- SMS — optional

בכל Deadline משפטי יש להציג את התאריך הרשמי/המחושב ואת מקור החישוב.

---

# 5. FULL NONPROVISIONAL PATENT APPLICATION

במהלך חלון 12 החודשים, המערכת תאפשר להתחיל בכל רגע:

## "Build My Full Patent Application"

המערכת תטען אוטומטית את כל המידע מה-Provisional.

לא מתחילים מחדש.

המערכת תבצע Gap Analysis:

### What was disclosed in Provisional?
### What has changed?
### What has been added?
### What requires more detail?
### Which proposed claims are supported by the Provisional?
### Which subject matter appears new?

יש לשמור הפרדה ברורה בין:

- `SUPPORTED_BY_PROVISIONAL`
- `NEW_AFTER_PROVISIONAL`
- `UNCERTAIN_SUPPORT`

אסור ל-AI להניח אוטומטית שכל פרט חדש מקבל את תאריך ה-Provisional.

---

# 6. CLAIMS ENGINE

ל-Nonprovisional יש לבנות Claims Engine ייעודי.

המערכת תציע, כאשר מתאים:

- Independent apparatus claims
- Independent method claims
- Independent system claims
- Dependent claims
- Alternative claim strategies

לכל Claim:

- Claim ID
- Version
- Type
- Parent claim
- Elements
- Specification support
- Figure support
- Provisional support
- Prior-art references
- Risk flags
- AI confidence
- Human approval status

---

# 7. CLAIM FEE ENGINE

המערכת חייבת לחשב עלויות Claim בצורה דינמית.

**אין Hard-Code של מחירי USPTO בתוך ה-AI Prompt.**

יש ליצור:

`USPTO_FEE_TABLE`

עם:

- fee_code
- fee_type
- large_entity_fee
- small_entity_fee
- micro_entity_fee
- effective_date
- source_url
- last_verified_at

המנוע יחשב בין היתר:

- Total number of claims
- Number of independent claims
- Multiple dependent claims
- Applicable entity status
- Base filing/search/examination fees
- Excess claim fees
- Other applicable filing surcharges

## Live Fee Estimator

**Claims:** 18  
**Independent Claims:** 3  
**Estimated USPTO Fees:** $X

כאשר המשתמש מוסיף Claim:

**Claims:** 21

המערכת תחשב מחדש ותציג אם נוצרה עלות Excess Claim.

### WARNING

> Adding this claim may increase the USPTO filing fee.

המחיר תמיד יוצג כ-Estimate עד לאימות מול Fee Schedule עדכני.

---

# 8. USER ONBOARDING

Create Account:

- Full legal name
- Email
- Phone
- Country
- Address
- Company, optional
- MFA
- Terms acceptance
- Privacy acceptance

לאחר מכן:

## START NEW INVENTION

Input:

- Text
- Voice
- Photos
- Video
- Drawings
- PDF
- DOCX
- Notes
- Existing invention documents

---

# 9. DYNAMIC AI INVENTION INTERVIEW

אין להשתמש רק בשאלון קבוע.

ה-AI צריך להבין מה חסר ולשאול שאלות המשך.

Core topics:

- What is the invention?
- What problem does it solve?
- How does it work?
- Components?
- Relationships?
- Sequence of operation?
- Alternatives?
- What is essential?
- What is optional?
- What makes it different?
- Who contributed?
- When was it conceived?
- Was it publicly disclosed?
- Was it offered for sale?
- Was it sold?
- Was it published?
- Was it demonstrated?
- Are there prototypes?
- Are there drawings?
- Were AI tools used?
- What did each human inventor contribute?

Interview Status:

`INCOMPLETE`

`NEEDS_CLARIFICATION`

`READY_FOR_PROVISIONAL_DRAFT`

---

# 10. INVENTION KNOWLEDGE GRAPH

כל המצאה תישמר במבנה Structured Data.

Entities:

- Component
- Feature
- Function
- Process
- Material
- Software Module
- Hardware Module
- Input
- Output
- Problem
- Solution
- Advantage
- Alternative
- Embodiment
- Figure
- Inventor
- Contribution
- Prior Art
- Claim

Relationships לדוגמה:

`Sensor → DETECTS → Condition`

`Controller → ACTIVATES → Pump`

`Claim Element → SUPPORTED_BY → Specification Paragraph`

`Claim → PRIORITY_SUPPORT → Provisional Section`

---

# 11. SOURCE-OF-TRUTH / ANTI-HALLUCINATION

כל Fact במערכת יקבל provenance:

- `USER_PROVIDED`
- `DOCUMENT_SUPPORTED`
- `AI_INFERRED`
- `AI_SUGGESTED`
- `EXTERNAL_SOURCE`
- `HUMAN_REVIEWED`

AI-generated suggestion לא נכנסת אוטומטית ל-Final Filing.

אם AI מציע feature חדש:

> "This is a possible variation. Is this actually part of your invention or something you want disclosed as an alternative?"

רק לאחר Confirmation ניתן להעביר אותו ל-Confirmed Invention Record.

---

# 12. PRIOR ART RESEARCH ENGINE

המערכת תבצע חיפוש במקורות רלוונטיים ותשמור:

- Patent/application number
- Title
- Publication date
- Priority date
- Inventor
- Assignee
- Abstract
- Relevant sections
- Patent family
- Similarity
- Matching features
- Differences
- URL/source
- Search timestamp

Output:

## PRIOR ART MAP

Reference A:
- Similarities
- Differences
- Potential risk
- Relevant claim elements

Reference B:
- Similarities
- Differences
- Potential risk

אין לכתוב:

**"Your invention is patentable."**

יש לכתוב הערכה זהירה ומנומקת.

---

# 13. PROVISIONAL DRAFTING AGENT

Agent ייצור Draft הכולל, בהתאם להמצאה:

1. Title
2. Short Summary
3. Technical Field
4. Background / Problem
5. Summary of Invention
6. Brief Description of Drawings
7. Detailed Description
8. Alternative Embodiments
9. Examples / Use Cases
10. Drawings
11. Optional internal draft claims
12. Inventor/Filing metadata

לפני Final:

`PROVISIONAL_COMPLETENESS_CHECK`

---

# 14. NONPROVISIONAL DRAFTING AGENT

ייצר, בהתאם לסוג הבקשה:

- Title
- Cross-reference / priority information where applicable
- Field
- Background
- Summary
- Brief Description of Drawings
- Detailed Description
- Claims
- Abstract
- Drawings
- Required filing metadata/forms

כל Section יהיה Versioned.

---

# 15. CLAIM-TO-SPECIFICATION AUDIT

לכל Claim Element:

`Claim Element → Specification Paragraph → Figure → Provisional Support`

אם אין תמיכה:

## RED FLAG

**Claim 7 contains an element that is not sufficiently documented.**

Actions:

- Ask inventor
- Add supported disclosure where appropriate
- Modify claim
- Remove element
- Send for professional review

---

# 16. DRAWING SYSTEM

המערכת תאפשר:

- Upload sketch
- Upload photo
- Upload CAD
- Upload screenshot
- AI figure suggestion
- Flowchart creation
- Figure numbering
- Reference numeral management

Figure Registry:

`FIG. 1`

`FIG. 2`

...

Component Registry:

`100 — System`

`110 — Sensor`

`120 — Controller`

יש לבצע Consistency Check בין Figures לבין Specification.

---

# 17. INVENTORSHIP ENGINE

המערכת תשאל כל אדם מה תרם ל-Conception.

Database:

`inventor_id`

`contribution_description`

`related_features`

`related_claims`

`confirmed_by_user`

`review_status`

AI אינו Inventor.

יש לשמור Audit Trail של החלטות Inventorship ולסמן מקרים לא ברורים לבדיקה מקצועית.

---

# 18. DISCLOSURE / DATE RISK ENGINE

שאלות חובה:

- Public disclosure?
- Website?
- Social media?
- Presentation?
- Investor pitch?
- Exhibition?
- Sale?
- Offer for sale?
- Publication?
- NDA?
- Date?
- Country?

אם קיים סיכון:

## RED FLAG

**Potential filing-date/public-disclosure issue detected.**

אין לתת מסקנה אוטומטית כאשר נדרש ניתוח משפטי פרטני.

---

# 19. MULTI-AGENT ARCHITECTURE

מומלץ להשתמש בסוכנים נפרדים:

### Agent 1 — Inventor Interviewer
אוסף מידע.

### Agent 2 — Technical Analyst
ממפה את ההמצאה.

### Agent 3 — Provisional Specialist
בונה Provisional.

### Agent 4 — Prior-Art Researcher
מחפש Prior Art.

### Agent 5 — Patentability Analyst
מבצע preliminary analysis.

### Agent 6 — Specification Writer
מייצר specification.

### Agent 7 — Claims Specialist
בונה claims.

### Agent 8 — Priority Support Auditor
בודק מה נתמך ב-Provisional.

### Agent 9 — Filing Compliance Auditor
בודק דרישות הגשה.

### Agent 10 — Hallucination Auditor
מזהה עובדות שה-AI המציא.

### Agent 11 — Fee Calculator
מחשב fees בצורה דטרמיניסטית.

### Agent 12 — Final Reviewer
מבצע Final QC.

Agents לא יאשרו אוטומטית אחד את השני.

---

# 20. APPLICATION STATE MACHINE

```text
DRAFT_INVENTION
      ↓
AI_INTERVIEW
      ↓
INVENTION_RECORD_COMPLETE
      ↓
PROVISIONAL_DRAFT
      ↓
PROVISIONAL_REVIEW
      ↓
PROVISIONAL_APPROVED
      ↓
PROVISIONAL_FILED
      ↓
12_MONTH_WINDOW_ACTIVE
      ↓
NONPROVISIONAL_PREPARATION
      ↓
CLAIMS_DRAFT
      ↓
PRIORITY_SUPPORT_AUDIT
      ↓
FINAL_VALIDATION
      ↓
USER_APPROVAL
      ↓
READY_TO_FILE
      ↓
FILED
      ↓
POST_FILING
```

---

# 21. DATABASE — CORE TABLES

Suggested tables:

```text
users
organizations
inventions
inventors
inventor_contributions
invention_components
invention_features
invention_relationships
invention_sources
uploaded_files
interview_sessions
interview_messages
disclosures
provisional_applications
provisional_sections
nonprovisional_applications
application_sections
claims
claim_elements
claim_support
figures
figure_components
prior_art_searches
prior_art_references
prior_art_matches
filings
filing_documents
filing_receipts
deadlines
notifications
uspto_fee_table
fee_estimates
approvals
audit_logs
ai_runs
ai_findings
risk_flags
document_versions
```

---

# 22. DOCUMENT VERSIONING

אסור Overwrite שקט.

כל שינוי:

- Version ID
- Previous Version
- Created At
- Created By
- AI Model
- Prompt/Workflow Version
- Change Summary
- Approval Status

Final filing יקבל immutable snapshot.

---

# 23. FINAL REVIEW SCREEN

לפני כל Filing:

## FINAL APPLICATION REVIEW

המשתמש חייב לבדוק:

- Application type
- Inventors
- Applicant
- Title
- Description
- Claims, when applicable
- Figures
- Priority/provisional information
- Fees
- Documents
- Filing destination

Checkboxes:

- [ ] I reviewed the inventor information.
- [ ] I reviewed the invention description.
- [ ] I reviewed the drawings.
- [ ] I reviewed the claims, if applicable.
- [ ] I reviewed the filing information.
- [ ] I authorize submission.

אין לבצע Filing ללא Explicit Approval.

---

# 24. FILING LAYER

יש לבנות Adapter Architecture ולא לקשור את כל המערכת לדרך הגשה אחת.

```text
FilingService
 ├── USPTOAdapter
 ├── ManualExportAdapter
 └── FutureInternationalAdapter
```

אם אין API רשמי/מורשה לביצוע פעולה מסוימת:

- אין לבצע browser automation מסוכן בלי אישור.
- Generate filing package.
- Guide user through Patent Center.
- Capture official receipt/application number after filing.

---

# 25. USPTO DATA SYNC

יש לבנות Service לעדכון מידע רשמי:

- Fee Schedule
- Form versions
- Filing requirements
- Relevant rule changes
- Patent Center requirements

כל Rule/Price:

`effective_from`

`effective_to`

`source`

`verified_at`

`version`

אין להסתמך על ידע סטטי של מודל AI עבור מחיר/טופס/Deadline.

---

# 26. SECURITY

המערכת מכילה IP סודי ולכן:

- TLS
- Encryption at rest
- MFA
- RBAC
- Tenant isolation
- Signed file URLs
- Malware scanning
- Secret manager
- Audit logs
- Session expiration
- Backup
- Disaster recovery
- Secure deletion
- Rate limiting
- API authorization
- Database row-level security where applicable

אין לשלוח את כל תיק ההמצאה לכל AI call.

שלח רק את המידע הנדרש ל-Agent הספציפי.

---

# 27. AI PROVIDER LAYER

אין לקשור את המערכת למודל יחיד.

```text
AIProvider
 ├── OpenAIProvider
 ├── AnthropicProvider
 ├── GeminiProvider
 └── FutureProvider
```

Config:

- model
- temperature
- max tokens
- workflow version
- privacy mode
- retry policy
- fallback provider

יש לשמור Logs ללא חשיפת Secrets.

---

# 28. KNOWLEDGE BASE של החברה

יש ליצור Knowledge Base מהניסיון הקיים של החברה:

- Previous applications
- Successful structures
- Interview questions
- Internal checklists
- Common errors
- Claim patterns
- Office Action lessons
- Filing procedures

אבל:

- לא להעתיק באופן עיוור טקסט מתיק לקוח אחר.
- להפריד Tenant/Client confidential data.
- להשתמש ב-RAG עם הרשאות.
- לשמור מקור לכל Retrieval.

---

# 29. UX — MOBILE FIRST

Mobile:

- Voice interview
- Camera
- Upload sketches
- Simple questions
- Progress
- Notifications

Desktop:

- Full document review
- Claim editor
- Figure management
- Prior art comparison
- Filing package review

Main progress bar:

```text
IDEA
→ INTERVIEW
→ PROVISIONAL
→ FILED
→ 12-MONTH WINDOW
→ FULL APPLICATION
→ CLAIMS
→ REVIEW
→ FILING
```

---

# 30. DASHBOARD

Card example:

## Smart Watering Device

**Stage:** PROVISIONAL FILED

**Filing Date:** 01/15/2026

**12-Month Date:** 01/15/2027

**Days Remaining:** 143

Buttons:

- Continue Patent Application
- View Provisional
- Add New Information
- View Prior Art
- Upload Documents
- Review Deadlines

---

# 31. ADMIN PANEL

Admin צריך לראות:

- Users
- Inventions
- Application stages
- AI failures
- Risk flags
- Pending approvals
- Filing status
- Deadlines
- Notification failures
- AI token/cost usage
- Storage usage
- Fee table status
- Last USPTO data verification
- Security events

אסור Admin רגיל לקבל אוטומטית גישה לתוכן המצאה סודי ללא Role מתאים.

---

# 32. MVP

## Phase 1

לבנות קודם:

1. Authentication
2. User dashboard
3. New invention
4. AI interview
5. Voice/text input
6. File/image upload
7. Structured invention record
8. Provisional drafting
9. Figures management
10. User review
11. PDF/DOCX export
12. Filing checklist
13. Filing date storage
14. 12-month countdown
15. Notifications
16. Audit logs

## Phase 2

1. Prior-art engine
2. Full Nonprovisional generator
3. Claims Engine
4. Claim support matrix
5. Priority support audit
6. Fee Engine
7. Advanced QC
8. USPTO filing integration where technically/legally available

## Phase 3

1. Office Action analysis
2. Response drafting
3. Portfolio management
4. International workflows
5. Professional reviewer portal
6. Licensing/valuation tools
7. Competitor patent monitoring

---

# 33. NON-NEGOTIABLE QUALITY RULES

1. Never fabricate invention facts.
2. Never fabricate USPTO requirements.
3. Never fabricate filing confirmation.
4. Never fabricate filing/application numbers.
5. Never fabricate prior art.
6. Never silently change inventor names.
7. Never silently add technical features.
8. Never silently submit an application.
9. Never hard-code legal deadlines solely in prompts.
10. Never hard-code current fees solely in prompts.
11. Every important AI conclusion needs provenance.
12. Every filed document must have an immutable version.
13. Every filing requires explicit user approval.
14. Every legal/technical uncertainty must be flagged.
15. Critical deadlines must be managed by deterministic code.

---

# 34. IMPORTANT PRODUCT WORDING

Avoid:

**"The provisional protects your invention for one year."**

Prefer:

**"A provisional application can establish an early U.S. filing date. It normally remains pending for 12 months, during which a corresponding nonprovisional application generally must be filed to claim the benefit of that earlier filing date."**

Avoid:

**"First you must file a provisional patent."**

Prefer:

**"For inventions eligible for a provisional filing, the platform can use a Provisional-First workflow when that strategy is appropriate."**

---

# 35. FUTURE INFORMATION PLACEHOLDER

הלקוח ציין שיישלח מידע נוסף בהמשך.

לכן הארכיטקטורה חייבת לאפשר הרחבת Rules ללא שינוי יסודי בקוד.

Create:

```text
rules_engine
workflow_rules
filing_requirements
fee_rules
jurisdiction_rules
document_templates
knowledge_base_versions
```

כל מידע חדש יתווסף כ-Versioned Rule/Knowledge ולא כ-Hard-coded Prompt.

---

# 36. DEFINITION OF SUCCESS

החוויה הרצויה:

**User:** "I have an invention."

**System:** "Tell me about it."

↓

AI interviews inventor

↓

System structures invention

↓

System identifies missing information

↓

System prepares Provisional package

↓

User reviews and approves

↓

Provisional is filed / filing recorded

↓

12-month clock begins

↓

System continuously prepares user for full application

↓

Prior art + specification + claims are developed

↓

System audits support back to Provisional

↓

Fees are calculated from current USPTO data

↓

User reviews final package

↓

Explicit authorization

↓

Filing workflow

↓

Official filing data stored

↓

Deadlines and prosecution tracked

---

# FINAL PRINCIPLE

## AI DOES THE INTELLIGENCE. SOFTWARE CONTROLS THE PROCESS.

המשתמש לא צריך לדעת איך לכתוב פטנט.

הוא צריך לדעת להסביר את ההמצאה שלו.

המערכת צריכה להפוך את ההסבר שלו לתהליך מסודר, מתועד, מאומת וניתן להגשה — בלי להמציא מידע ובלי להסתיר מהמשתמש החלטות חשובות.
