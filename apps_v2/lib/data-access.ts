import { executeQuery } from "./db"
import type {
  Submission,
  MissingDataItem,
  DuplicateInfo,
  ComplianceCheck,
  GuidelineCheck,
  PendingAction,
  SummaryStats,
  DistributionData,
  WorkflowStage,
} from "./types"

// Submissions
export async function getAllSubmissions(): Promise<Submission[]> {
  return executeQuery<Submission>(`
    SELECT * FROM submissions
    ORDER BY "submissionDate" DESC
  `)
}

export async function getSubmissionsByStage(stage: WorkflowStage): Promise<Submission[]> {
  return executeQuery<Submission>(
    `
    SELECT * FROM submissions
    WHERE stage = $1
    ORDER BY "submissionDate" DESC
  `,
    [stage],
  )
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const submissions = await executeQuery<Submission>(
    `
    SELECT * FROM submissions
    WHERE id = $1
  `,
    [id],
  )

  return submissions.length > 0 ? submissions[0] : null
}

export async function getRecentSubmissions(limit = 10): Promise<Submission[]> {
  return executeQuery<Submission>(
    `
    SELECT * FROM submissions
    ORDER BY "submissionDate" DESC
    LIMIT $1
  `,
    [limit],
  )
}

// Missing Data Items
export async function getMissingDataBySubmissionId(submissionId: string): Promise<MissingDataItem[]> {
  return executeQuery<MissingDataItem>(
    `
    SELECT * FROM missing_data_items
    WHERE "submissionId" = $1
  `,
    [submissionId],
  )
}

export async function getSubmissionsWithMissingData(): Promise<Submission[]> {
  return executeQuery<Submission>(`
    SELECT s.* FROM submissions s
    JOIN missing_data_items m ON s.id = m."submissionId"
    WHERE s.status = 'needs-info'
    GROUP BY s.id
    ORDER BY s."submissionDate" DESC
  `)
}

// Duplicate Info
export async function getDuplicateInfoBySubmissionId(submissionId: string): Promise<DuplicateInfo | null> {
  const duplicates = await executeQuery<DuplicateInfo>(
    `
    SELECT * FROM duplicate_info
    WHERE "submissionId" = $1
  `,
    [submissionId],
  )

  return duplicates.length > 0 ? duplicates[0] : null
}

export async function getSubmissionsWithDuplicateStatus(): Promise<Submission[]> {
  return executeQuery<Submission>(`
    SELECT * FROM submissions
    WHERE status = 'duplicate' OR status = 'unique'
    ORDER BY "submissionDate" DESC
  `)
}

// Compliance Checks
export async function getComplianceChecksBySubmissionId(submissionId: string): Promise<ComplianceCheck[]> {
  return executeQuery<ComplianceCheck>(
    `
    SELECT * FROM compliance_checks
    WHERE "submissionId" = $1
  `,
    [submissionId],
  )
}

export async function getSubmissionsWithComplianceStatus(): Promise<Submission[]> {
  return executeQuery<Submission>(`
    SELECT * FROM submissions
    WHERE status = 'compliant' OR status = 'non-compliant' OR 
          (status = 'processing' AND stage = 'enrichment')
    ORDER BY "submissionDate" DESC
  `)
}

// Guideline Checks
export async function getGuidelineChecksBySubmissionId(submissionId: string): Promise<GuidelineCheck[]> {
  return executeQuery<GuidelineCheck>(
    `
    SELECT * FROM guideline_checks
    WHERE "submissionId" = $1
  `,
    [submissionId],
  )
}

export async function getSubmissionsWithGuidelineStatus(): Promise<Submission[]> {
  return executeQuery<Submission>(`
    SELECT * FROM submissions
    WHERE status = 'proceed' OR status = 'survey' OR status = 'reject'
    ORDER BY "submissionDate" DESC
  `)
}

// Pending Actions
export async function getPendingActions(): Promise<PendingAction[]> {
  return executeQuery<PendingAction>(`
    SELECT * FROM pending_actions
    ORDER BY 
      CASE 
        WHEN priority = 'high' THEN 1
        WHEN priority = 'medium' THEN 2
        WHEN priority = 'low' THEN 3
      END
  `)
}

// Summary Statistics
export async function getSummaryStats(): Promise<SummaryStats> {
  const [totalStats] = await executeQuery<SummaryStats>(`
    SELECT 
      COUNT(*) as "totalSubmissions",
      SUM(CASE WHEN status = 'needs-info' THEN 1 ELSE 0 END) as "missingInformation",
      SUM(CASE WHEN stage = 'extraction' AND status != 'needs-info' THEN 1 ELSE 0 END) as "completedExtractions",
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as "rejectedSubmissions",
      SUM(CASE WHEN status = 'duplicate' THEN 1 ELSE 0 END) as "duplicateSubmissions",
      SUM(CASE WHEN status = 'unique' THEN 1 ELSE 0 END) as "uniqueSubmissions",
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as "processingSubmissions",
      SUM(CASE WHEN status = 'non-compliant' THEN 1 ELSE 0 END) as "nonCompliantSubmissions",
      SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as "compliantSubmissions",
      SUM(CASE WHEN status = 'processing' AND stage = 'enrichment' THEN 1 ELSE 0 END) as "inProgressSubmissions",
      SUM(CASE WHEN status = 'proceed' THEN 1 ELSE 0 END) as "proceedToQuote",
      SUM(CASE WHEN status = 'survey' THEN 1 ELSE 0 END) as "surveyRecommended",
      SUM(CASE WHEN status = 'reject' THEN 1 ELSE 0 END) as "rejected"
    FROM submissions
  `)

  return (
    totalStats || {
      totalSubmissions: 0,
      missingInformation: 0,
      completedExtractions: 0,
      rejectedSubmissions: 0,
      duplicateSubmissions: 0,
      uniqueSubmissions: 0,
      processingSubmissions: 0,
      nonCompliantSubmissions: 0,
      compliantSubmissions: 0,
      inProgressSubmissions: 0,
      proceedToQuote: 0,
      surveyRecommended: 0,
      rejected: 0,
    }
  )
}

// Distribution Data
export async function getWorkflowDistribution(): Promise<DistributionData[]> {
  const results = await executeQuery<{ name: string; value: number }>(`
    SELECT 
      CASE 
        WHEN stage = 'extraction' THEN 'Missing Data Check'
        WHEN stage = 'core-data' THEN 'Data Duplication Check'
        WHEN stage = 'enrichment' THEN 'Compliance Check'
        WHEN stage = 'rank' THEN 'Guideline Check'
      END as name,
      COUNT(*) as value
    FROM submissions
    GROUP BY stage
  `)

  // Add colors to the results
  const colors = {
    "Missing Data Check": "#3ABFF8",
    "Data Duplication Check": "#FBBF24",
    "Compliance Check": "#6366F1",
    "Guideline Check": "#10B981",
  }

  return results.map((item) => ({
    ...item,
    color: colors[item.name as keyof typeof colors],
  }))
}

// Update submission status
export async function updateSubmissionStatus(id: string, status: string): Promise<void> {
  await executeQuery(
    `
    UPDATE submissions
    SET status = $1
    WHERE id = $2
  `,
    [status, id],
  )
}

// Move submission to next stage
export async function moveSubmissionToNextStage(id: string): Promise<void> {
  await executeQuery(
    `
    UPDATE submissions
    SET stage = 
      CASE 
        WHEN stage = 'extraction' THEN 'core-data'
        WHEN stage = 'core-data' THEN 'enrichment'
        WHEN stage = 'enrichment' THEN 'rank'
        ELSE stage
      END
    WHERE id = $1
  `,
    [id],
  )
}
