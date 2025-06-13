-- Database permissions and security setup
-- This script sets up appropriate permissions for the application

-- Create application user (replace with your actual application user)
-- Note: You may need to run this as a superuser
CREATE USER user_final WITH PASSWORD 'p@sswordGRE27';

-- Grant necessary permissions to the application user
GRANT CONNECT ON DATABASE postgres TO user_final;
GRANT USAGE ON SCHEMA public TO user_final;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO user_final;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO user_final;

-- Grant permissions on views
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO user_final;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO user_final;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO user_final;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO user_final;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON VIEWS TO user_final;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO user_final;

-- Create indexes for better performance (if not already created)
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_updated_at ON submissions(updated_at);
CREATE INDEX IF NOT EXISTS idx_submissions_client ON submissions(client);
CREATE INDEX IF NOT EXISTS idx_submissions_broker ON submissions(broker);
CREATE INDEX IF NOT EXISTS idx_submissions_line_of_business ON submissions("lineOfBusiness");

-- Create partial indexes for specific queries
CREATE INDEX IF NOT EXISTS idx_submissions_needs_info ON submissions(id) WHERE status = 'needs-info';
CREATE INDEX IF NOT EXISTS idx_submissions_duplicate ON submissions(id) WHERE status = 'duplicate';
CREATE INDEX IF NOT EXISTS idx_submissions_processing ON submissions(id) WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_pending_actions_not_completed ON pending_actions(id) WHERE is_completed = FALSE;

-- Add row-level security (optional, for multi-tenant scenarios)
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE missing_data_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE duplicate_info ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE guideline_checks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pending_actions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and modify as needed)
-- CREATE POLICY submissions_policy ON submissions FOR ALL TO insurance_app USING (true);
-- CREATE POLICY missing_data_policy ON missing_data_items FOR ALL TO insurance_app USING (true);
