import { apiClient } from "@/lib/api-client";
import type {
  TokenResponse,
  AuthUser,
  InventionSummary,
  InventionDetail,
  InterviewState,
  Inventor,
  Disclosure,
  ProvisionalApplication,
  ProvisionalSection,
  Deadline,
  Dashboard,
  AuditLogEntry,
} from "@/lib/types";

// --- Auth --------------------------------------------------------------

export async function register(full_name: string, email: string, password: string) {
  const { data } = await apiClient.post<TokenResponse>("/auth/register", {
    full_name,
    email,
    password,
  });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", { email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
}

export async function googleLogin(credential: string) {
  const { data } = await apiClient.post<TokenResponse>("/auth/google", { credential });
  return data;
}

// --- Inventions ----------------------------------------------------------

export async function listInventions() {
  const { data } = await apiClient.get<InventionSummary[]>("/inventions");
  return data;
}

export async function createInvention(title: string, opening_description: string) {
  const { data } = await apiClient.post<InventionDetail>("/inventions", {
    title,
    opening_description,
  });
  return data;
}

export async function getInvention(id: string) {
  const { data } = await apiClient.get<InventionDetail>(`/inventions/${id}`);
  return data;
}

export async function getInterview(id: string) {
  const { data } = await apiClient.get<InterviewState>(`/inventions/${id}/interview`);
  return data;
}

export async function postInterviewMessage(id: string, content: string) {
  const { data } = await apiClient.post<InterviewState>(`/inventions/${id}/interview/messages`, {
    content,
  });
  return data;
}

export async function confirmFact(
  id: string,
  topic: string,
  fact_id: string,
  confirmed: boolean
) {
  const { data } = await apiClient.post<InventionDetail>(`/inventions/${id}/record/confirm-fact`, {
    topic,
    fact_id,
    confirmed,
  });
  return data;
}

// --- Inventors -------------------------------------------------------------

export async function listInventors(id: string) {
  const { data } = await apiClient.get<Inventor[]>(`/inventions/${id}/inventors`);
  return data;
}

export async function addInventor(
  id: string,
  payload: { full_name: string; residence_country?: string; contribution_description?: string }
) {
  const { data } = await apiClient.post<Inventor>(`/inventions/${id}/inventors`, payload);
  return data;
}

export async function confirmInventor(id: string, inventorId: string, confirmed: boolean) {
  const { data } = await apiClient.patch<Inventor>(
    `/inventions/${id}/inventors/${inventorId}/confirm`,
    { confirmed }
  );
  return data;
}

// --- Disclosures -----------------------------------------------------------

export async function listDisclosures(id: string) {
  const { data } = await apiClient.get<Disclosure[]>(`/inventions/${id}/disclosures`);
  return data;
}

export async function addDisclosure(
  id: string,
  payload: { disclosure_type: string; occurred: boolean; event_date?: string; country?: string; details?: string }
) {
  const { data } = await apiClient.post<Disclosure>(`/inventions/${id}/disclosures`, payload);
  return data;
}

// --- Provisional -----------------------------------------------------------

export async function generateProvisionalDraft(id: string) {
  const { data } = await apiClient.post<ProvisionalApplication>(`/inventions/${id}/provisional/draft`);
  return data;
}

export async function getProvisional(id: string) {
  const { data } = await apiClient.get<ProvisionalApplication>(`/inventions/${id}/provisional`);
  return data;
}

export async function updateProvisionalSection(
  id: string,
  sectionKey: string,
  content: string,
  change_summary?: string
) {
  const { data } = await apiClient.put<ProvisionalSection>(
    `/inventions/${id}/provisional/sections/${sectionKey}`,
    { content, change_summary }
  );
  return data;
}

export interface ApprovalChecklist {
  reviewed_inventor_information: boolean;
  reviewed_invention_description: boolean;
  reviewed_drawings: boolean;
  reviewed_claims: boolean;
  reviewed_filing_information: boolean;
  authorize_submission: boolean;
}

export async function approveProvisional(id: string, checklist: ApprovalChecklist) {
  const { data } = await apiClient.post<ProvisionalApplication>(
    `/inventions/${id}/provisional/approve`,
    checklist
  );
  return data;
}

export async function recordFiling(id: string, filing_date: string, application_number: string) {
  const { data } = await apiClient.post<ProvisionalApplication>(
    `/inventions/${id}/provisional/record-filing`,
    { filing_date, application_number }
  );
  return data;
}

export async function downloadProvisionalPdf(id: string, filename: string) {
  const response = await apiClient.get(`/inventions/${id}/provisional/export.pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function listDeadlines(id: string) {
  const { data } = await apiClient.get<Deadline[]>(`/inventions/${id}/deadlines`);
  return data;
}

// --- Dashboard / Audit -------------------------------------------------------

export async function getDashboard(id: string) {
  const { data } = await apiClient.get<Dashboard>(`/inventions/${id}/dashboard`);
  return data;
}

export async function getAuditLog(id: string) {
  const { data } = await apiClient.get<AuditLogEntry[]>(`/inventions/${id}/audit-log`);
  return data;
}
