-- Insurance Dashboard Database Schema
-- This script creates all necessary tables for the insurance quote automation system

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE workflow_stage AS ENUM ('extraction', 'core-data', 'enrichment', 'rank');
CREATE TYPE submission_status AS ENUM (
    'pending', 'processing', 'approved', 'rejected', 'needs-info', 
    'duplicate', 'unique', 'compliant', 'non-compliant', 'proceed', 'survey'
);
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE check_status AS ENUM ('passed', 'failed', 'pending');

-- Main submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    client VARCHAR(255) NOT NULL,
    broker VARCHAR(255) NOT NULL,
    "submissionDate" DATE NOT NULL,
    stage workflow_stage NOT NULL DEFAULT 'extraction',
    status submission_status NOT NULL DEFAULT 'pending',
    "lineOfBusiness" VARCHAR(100) NOT NULL,
    premium DECIMAL(12, 2),
    location TEXT,
    "propertyType" VARCHAR(255),
    "coverageAmount" VARCHAR(100),
    "emailContent" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Missing data items table
CREATE TABLE missing_data_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    field VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity priority_level NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Duplicate information table
CREATE TABLE duplicate_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    "originalSubmissionId" UUID NOT NULL REFERENCES submissions(id),
    reference VARCHAR(50) NOT NULL,
    client VARCHAR(255) NOT NULL,
    "submissionDate" DATE NOT NULL,
    broker VARCHAR(255) NOT NULL,
    "matchConfidence" INTEGER NOT NULL CHECK ("matchConfidence" >= 0 AND "matchConfidence" <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance checks table
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status check_status NOT NULL DEFAULT 'pending',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guideline checks table
CREATE TABLE guideline_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status check_status NOT NULL DEFAULT 'pending',
    details TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    "maxScore" INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pending actions table
CREATE TABLE pending_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'medium',
    stage VARCHAR(100) NOT NULL,
    "submissionId" UUID REFERENCES submissions(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email drafts table (for storing AI-generated emails)
CREATE TABLE email_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    email_type VARCHAR(50) NOT NULL, -- 'missing_data', 'duplicate', 'compliance', 'guideline'
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table for tracking changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID REFERENCES submissions(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_submissions_stage ON submissions(stage);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submission_date ON submissions("submissionDate");
CREATE INDEX idx_submissions_reference ON submissions(reference);
CREATE INDEX idx_missing_data_submission_id ON missing_data_items("submissionId");
CREATE INDEX idx_duplicate_info_submission_id ON duplicate_info("submissionId");
CREATE INDEX idx_compliance_checks_submission_id ON compliance_checks("submissionId");
CREATE INDEX idx_guideline_checks_submission_id ON guideline_checks("submissionId");
CREATE INDEX idx_pending_actions_priority ON pending_actions(priority);
CREATE INDEX idx_pending_actions_completed ON pending_actions(is_completed);
CREATE INDEX idx_email_drafts_submission_id ON email_drafts("submissionId");
CREATE INDEX idx_audit_log_submission_id ON audit_log("submissionId");

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guideline_checks_updated_at BEFORE UPDATE ON guideline_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_actions_updated_at BEFORE UPDATE ON pending_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_drafts_updated_at BEFORE UPDATE ON email_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
