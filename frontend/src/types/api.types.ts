// ── Response envelope ──────────────────────────────────────────────────────────
// Every response from the backend follows this shape.

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data:    T;
}

export interface ApiError {
  success: false;
  message: string;
  data:    null;
}

// A response is either a success or an error
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Member ─────────────────────────────────────────────────────────────────────

// The three values the API accepts for codingLevel — nothing else is valid
export type CodingLevel = "beginner" | "intermediate" | "advanced";

// Shape of a member returned by the API
export interface ApiMember {
  id:             string;
  name:           string;
  email:          string;
  githubUsername: string;
  orgName:        string;
  joinReason:     string;
  codingLevel:    CodingLevel;
  createdAt:      string;
  updatedAt:      string;
}

// What we send to POST /members
export interface CreateMemberPayload {
  name:           string;
  email:          string;
  githubUsername: string;
  orgName:        string;
  joinReason:     string;
  codingLevel:    CodingLevel;
}

// ── Partner ────────────────────────────────────────────────────────────────────
export interface ApiPartner {
  id:               string;
  name:             string;
  websiteUrl:       string;
  logoUrl:          string;
  description:      string;
  email:            string;
  partershipReason: string;
  createdAt:        string;
  updatedAt:        string;
}

// What we send to POST /partners
export interface CreatePartnerPayload {
  name:             string;
  websiteUrl:       string;
  logoUrl:          string;
  description:      string;
  email:            string;
  partershipReason: string; // intentional — matches the API typo
}