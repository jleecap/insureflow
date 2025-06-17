-- Useful functions for the insurance dashboard application

-- Function to get submission progress percentage
CREATE OR REPLACE FUNCTION get_submission_progress(submission_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_stage workflow_stage;
    current_status submission_status;
    progress INTEGER;
BEGIN
    SELECT stage, status INTO current_stage, current_status
    FROM submissions
    WHERE id = submission_id;
    
    IF current_status = 'rejected' OR current_status = 'reject' THEN
        RETURN 0;
    END IF;
    
    CASE current_stage
        WHEN 'extraction' THEN progress := 25;
        WHEN 'core-data' THEN progress := 50;
        WHEN 'enrichment' THEN progress := 75;
        WHEN 'rank' THEN progress := 100;
        ELSE progress := 0;
    END CASE;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to move submission to next stage
CREATE OR REPLACE FUNCTION move_to_next_stage(submission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_stage workflow_stage;
    next_stage workflow_stage;
BEGIN
    SELECT stage INTO current_stage
    FROM submissions
    WHERE id = submission_id;
    
    CASE current_stage
        WHEN 'extraction' THEN next_stage := 'core-data';
        WHEN 'core-data' THEN next_stage := 'enrichment';
        WHEN 'enrichment' THEN next_stage := 'rank';
        ELSE RETURN FALSE; -- Already at final stage
    END CASE;
    
    UPDATE submissions
    SET stage = next_stage, status = 'processing', updated_at = CURRENT_TIMESTAMP
    WHERE id = submission_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate overall guideline score
CREATE OR REPLACE FUNCTION calculate_guideline_score(submission_id UUID)
RETURNS INTEGER AS $$
DECLARE
    avg_score DECIMAL;
BEGIN
    SELECT AVG(score) INTO avg_score
    FROM guideline_checks
    WHERE "submissionId" = submission_id AND score IS NOT NULL;
    
    IF avg_score IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND(avg_score);
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance check progress
CREATE OR REPLACE FUNCTION get_compliance_progress(submission_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_checks INTEGER;
    completed_checks INTEGER;
    progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_checks
    FROM compliance_checks
    WHERE "submissionId" = submission_id;
    
    IF total_checks = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_checks
    FROM compliance_checks
    WHERE "submissionId" = submission_id AND status != 'pending';
    
    progress := ROUND((completed_checks::DECIMAL / total_checks) * 100);
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_submission_id UUID,
    p_action VARCHAR(100),
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_user_id VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_log ("submissionId", action, old_values, new_values, user_id)
    VALUES (p_submission_id, p_action, p_old_values, p_new_values, p_user_id)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get submissions by stage with pagination
CREATE OR REPLACE FUNCTION get_submissions_by_stage(
    p_stage workflow_stage DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    reference VARCHAR(50),
    client VARCHAR(255),
    broker VARCHAR(255),
    "submissionDate" DATE,
    stage workflow_stage,
    status submission_status,
    "lineOfBusiness" VARCHAR(100),
    premium DECIMAL(12, 2),
    location TEXT,
    "propertyType" VARCHAR(255),
    "coverageAmount" VARCHAR(100)
) AS $$
BEGIN
    IF p_stage IS NULL THEN
        RETURN QUERY
        SELECT s.id, s.reference, s.client, s.broker, s."submissionDate", 
               s.stage, s.status, s."lineOfBusiness", s.premium, s.location, 
               s."propertyType", s."coverageAmount"
        FROM submissions s
        ORDER BY s."submissionDate" DESC
        LIMIT p_limit OFFSET p_offset;
    ELSE
        RETURN QUERY
        SELECT s.id, s.reference, s.client, s.broker, s."submissionDate", 
               s.stage, s.status, s."lineOfBusiness", s.premium, s.location, 
               s."propertyType", s."coverageAmount"
        FROM submissions s
        WHERE s.stage = p_stage
        ORDER BY s."submissionDate" DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
END;
$$ LANGUAGE plpgsql;
