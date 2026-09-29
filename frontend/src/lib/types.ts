// Mirrors backend/app/schemas/*.py — keep in sync manually (no codegen yet).

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  entity_type: string | null;
  locale: string;
  is_active: boolean;
  subscription_tier: string;
  kyc_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface StructuredFact {
  id: string;
  value: string;
  provenance: "USER_PROVIDED" | "DOCUMENT_SUPPORTED" | "AI_INFERRED" | "AI_SUGGESTED" | "EXTERNAL_SOURCE" | "HUMAN_REVIEWED";
  confirmed: boolean;
  source_message_id: string | null;
}

export type StructuredRecord = Record<string, StructuredFact[]>;

export interface InventionSummary {
  id: string;
  title: string;
  status: string;
  interview_status: string;
  short_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventionDetail extends InventionSummary {
  problem_solved: string | null;
  technical_field: string | null;
  structured_record: StructuredRecord;
}

export interface InterviewMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface InterviewState {
  invention_id: string;
  interview_status: string;
  messages: InterviewMessage[];
  structured_record: StructuredRecord;
  missing_topics: string[];
}

export interface Inventor {
  id: string;
  full_name: string;
  residence_country: string | null;
  contribution_description: string | null;
  is_primary_user: boolean;
  confirmed_by_user: boolean;
  review_status: string;
}

export interface Disclosure {
  id: string;
  disclosure_type: string;
  occurred: boolean;
  event_date: string | null;
  country: string | null;
  details: string | null;
  risk_flag: boolean;
  created_at: string;
}

export interface ProvisionalSection {
  id: string;
  section_key: string;
  content: string;
  version: number;
  created_by: string;
  change_summary: string | null;
  created_at: string;
}

export interface ProvisionalApplication {
  id: string;
  invention_id: string;
  status: string;
  filing_date: string | null;
  twelve_month_date: string | null;
  application_number: string | null;
  completeness_report: {
    passed: boolean;
    sections: Record<string, { word_count: number; min_required: number; ok: boolean }>;
    checked_at: string;
  } | null;
  approved_checklist: Record<string, boolean> | null;
  sections: ProvisionalSection[];
}

export interface Deadline {
  id: string;
  threshold_key: string;
  label: string;
  due_date: string;
  source: string;
}

export interface Dashboard {
  invention_id: string;
  title: string;
  status: string;
  provisional_status: string | null;
  filing_date: string | null;
  twelve_month_date: string | null;
  days_remaining: number | null;
  application_number: string | null;
  upcoming_deadlines: Deadline[];
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}

export const PROVISIONAL_SECTION_KEYS = [
  "title",
  "short_summary",
  "technical_field",
  "background",
  "summary_of_invention",
  "brief_description_of_drawings",
  "detailed_description",
  "alternative_embodiments",
  "examples_use_cases",
  "draft_claims",
] as const;

export const STRUCTURED_RECORD_TOPICS = [
  "components",
  "functions",
  "connections",
  "process_workflow",
  "inputs",
  "outputs",
  "materials",
  "software_hardware",
  "configurations",
  "use_cases",
  "alternative_embodiments",
  "optional_features",
  "variations",
  "known_prototypes",
  "technical_limitations",
  "advantages",
] as const;

export const INVENTION_STATUS_LABELS: Record<string, string> = {
  DRAFT_INVENTION: "Draft",
  AI_INTERVIEW: "Interview in progress",
  INVENTION_RECORD_COMPLETE: "Record complete",
  PROVISIONAL_DRAFT: "Provisional drafted",
  PROVISIONAL_REVIEW: "Provisional in review",
  PROVISIONAL_APPROVED: "Provisional approved",
  PROVISIONAL_FILED: "Provisional filed",
  "12_MONTH_WINDOW_ACTIVE": "12-month window active",
  NONPROVISIONAL_PREPARATION: "Preparing nonprovisional",
  CLAIMS_DRAFT: "Claims drafted",
  PRIORITY_SUPPORT_AUDIT: "Priority support audit",
  FINAL_VALIDATION: "Final validation",
  USER_APPROVAL: "Awaiting your approval",
  READY_TO_FILE: "Ready to file",
  FILED: "Filed",
  POST_FILING: "Post-filing",
};
