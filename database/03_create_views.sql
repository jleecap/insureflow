-- Create useful views for reporting and dashboard queries
-- These views simplify complex queries and improve performance

-- Summary statistics view
CREATE OR REPLACE VIEW submission_summary_stats AS
SELECT 
    COUNT(*) as total_submissions,
    SUM(CASE WHEN status = 'needs-info' THEN 1 ELSE 0 END) as missing_information,
    SUM(CASE WHEN stage = 'extraction' AND status != 'needs-info' THEN 1 ELSE 0 END) as completed_extractions,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_submissions,
    SUM(CASE WHEN status = 'duplicate' THEN 1 ELSE 0 END) as duplicate_submissions,
    SUM(CASE WHEN status = 'unique' THEN 1 ELSE 0 END) as unique_submissions,
    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_submissions,
    SUM(CASE WHEN status = 'non-compliant' THEN 1 ELSE 0 END) as non_compliant_submissions,
    SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as compliant_submissions,
    SUM(CASE WHEN status = 'processing' AND stage = 'enrichment' THEN 1 ELSE 0 END) as in_progress_submissions,
    SUM(CASE WHEN status = 'proceed' THEN 1 ELSE 0 END) as proceed_to_quote,
    SUM(CASE WHEN status = 'survey' THEN 1 ELSE 0 END) as survey_recommended,
    SUM(CASE WHEN status = 'reject' THEN 1 ELSE 0 END) as rejected
FROM submissions;

-- Workflow distribution view
CREATE OR REPLACE VIEW workflow_distribution AS
SELECT 
    CASE 
        WHEN stage = 'extraction' THEN 'Missing Data Check'
        WHEN stage = 'core-data' THEN 'Data Duplication Check'
        WHEN stage = 'enrichment' THEN 'Compliance Check'
        WHEN stage = 'rank' THEN 'Guideline Check'
    END as stage_name,
    stage,
    COUNT(*) as submission_count
FROM submissions
GROUP BY stage
ORDER BY 
    CASE stage
        WHEN 'extraction' THEN 1
        WHEN 'core-data' THEN 2
        WHEN 'enrichment' THEN 3
        WHEN 'rank' THEN 4
    END;

-- Submissions with missing data view
CREATE OR REPLACE VIEW submissions_with_missing_data AS
SELECT 
    s.*,
    COUNT(m.id) as missing_data_count,
    STRING_AGG(m.field, ', ') as missing_fields
FROM submissions s
LEFT JOIN missing_data_items m ON s.id = m."submissionId"
WHERE s.status = 'needs-info'
GROUP BY s.id
ORDER BY s."submissionDate" DESC;

-- Submissions with compliance status view
CREATE OR REPLACE VIEW submissions_with_compliance_status AS
SELECT 
    s.*,
    COUNT(c.id) as total_checks,
    SUM(CASE WHEN c.status = 'passed' THEN 1 ELSE 0 END) as passed_checks,
    SUM(CASE WHEN c.status = 'failed' THEN 1 ELSE 0 END) as failed_checks,
    SUM(CASE WHEN c.status = 'pending' THEN 1 ELSE 0 END) as pending_checks,
    CASE 
        WHEN COUNT(c.id) = 0 THEN 0
        ELSE ROUND((SUM(CASE WHEN c.status = 'passed' THEN 1 ELSE 0 END)::DECIMAL / COUNT(c.id)) * 100, 0)
    END as compliance_percentage
FROM submissions s
LEFT JOIN compliance_checks c ON s.id = c."submissionId"
WHERE s.stage = 'enrichment' OR s.status IN ('compliant', 'non-compliant')
GROUP BY s.id
ORDER BY s."submissionDate" DESC;

-- Submissions with guideline scores view
CREATE OR REPLACE VIEW submissions_with_guideline_scores AS
SELECT 
    s.*,
    COUNT(g.id) as total_checks,
    SUM(CASE WHEN g.status = 'passed' THEN 1 ELSE 0 END) as passed_checks,
    SUM(CASE WHEN g.status = 'failed' THEN 1 ELSE 0 END) as failed_checks,
    CASE 
        WHEN COUNT(g.id) = 0 THEN 0
        ELSE ROUND(AVG(g.score), 0)
    END as overall_score
FROM submissions s
LEFT JOIN guideline_checks g ON s.id = g."submissionId"
WHERE s.stage = 'rank' OR s.status IN ('proceed', 'survey', 'reject')
GROUP BY s.id
ORDER BY s."submissionDate" DESC;

-- Recent activity view
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    s.id,
    s.reference,
    s.client,
    s.broker,
    s.stage,
    s.status,
    s."lineOfBusiness",
    s.updated_at,
    CASE 
        WHEN s.stage = 'extraction' THEN 'Missing Data Check'
        WHEN s.stage = 'core-data' THEN 'Data Duplication Check'
        WHEN s.stage = 'enrichment' THEN 'Compliance Check'
        WHEN s.stage = 'rank' THEN 'Guideline Check'
    END as stage_name
FROM submissions s
ORDER BY s.updated_at DESC
LIMIT 20;

-- Pending actions summary view
CREATE OR REPLACE VIEW pending_actions_summary AS
SELECT 
    priority,
    COUNT(*) as action_count,
    stage
FROM pending_actions
WHERE is_completed = FALSE
GROUP BY priority, stage
ORDER BY 
    CASE priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END,
    stage;
