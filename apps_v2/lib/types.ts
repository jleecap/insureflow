export type WorkflowStage = "extraction" | "core-data" | "enrichment" | "rank"
export type SubmissionStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "needs-info"
  | "duplicate"
  | "unique"
  | "compliant"
  | "non-compliant"
  | "proceed"
  | "survey"

export interface Submission {
  id: string
  reference: string
  client: string
  broker: string
  submissionDate: string
  stage: WorkflowStage
  status: SubmissionStatus
  lineOfBusiness: string
  premium?: number
  location?: string
  propertyType?: string
  coverageAmount?: string
  emailContent?: string
}

export interface MissingDataItem {
  id: string
  submissionId: string
  field: string
  description: string
  severity: "high" | "medium" | "low"
}

export interface DuplicateInfo {
  id: string
  submissionId: string
  originalSubmissionId: string
  reference: string
  client: string
  submissionDate: string
  broker: string
  matchConfidence: number
}

export interface ComplianceCheck {
  id: string
  submissionId: string
  name: string
  status: "passed" | "failed" | "pending"
  details?: string
}

export interface GuidelineCheck {
  id: string
  submissionId: string
  name: string
  status: "passed" | "failed" | "pending"
  details?: string
}

export interface PendingAction {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  stage: string
}

export interface SummaryStats {
  totalSubmissions: number
  missingInformation: number
  completedExtractions: number
  rejectedSubmissions: number
  duplicateSubmissions: number
  uniqueSubmissions: number
  processingSubmissions: number
  nonCompliantSubmissions: number
  compliantSubmissions: number
  inProgressSubmissions: number
  proceedToQuote: number
  surveyRecommended: number
  rejected: number
}

export interface DistributionData {
  name: string
  value: number
  color: string
}
