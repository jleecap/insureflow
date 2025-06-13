# Insurance Dashboard Database Setup

This folder contains all the necessary SQL scripts and setup files for the Insurance Dashboard PostgreSQL database.

## Files Overview

1. **01_create_tables.sql** - Creates all necessary tables, indexes, and triggers
2. **02_insert_dummy_data.sql** - Populates the database with realistic test data
3. **03_create_views.sql** - Creates useful views for reporting and dashboard queries
4. **04_create_functions.sql** - Creates utility functions for common operations
5. **05_setup_permissions.sql** - Sets up database permissions and security
6. **run_setup.sh** - Bash script to run all setup files in the correct order

## Database Schema

### Core Tables

- **submissions** - Main table storing insurance submission data
- **missing_data_items** - Items that are missing from submissions
- **duplicate_info** - Information about duplicate submissions
- **compliance_checks** - Compliance verification results
- **guideline_checks** - Underwriting guideline evaluation results
- **pending_actions** - Actions that need to be completed
- **email_drafts** - AI-generated email drafts
- **audit_log** - Audit trail for all changes

### Views

- **submission_summary_stats** - Aggregated statistics for the dashboard
- **workflow_distribution** - Distribution of submissions across workflow stages
- **submissions_with_missing_data** - Submissions that need additional information
- **submissions_with_compliance_status** - Compliance check status and progress
- **submissions_with_guideline_scores** - Guideline evaluation scores
- **recent_activity** - Recent submission activity
- **pending_actions_summary** - Summary of pending actions by priority

### Functions

- **get_submission_progress()** - Calculate submission progress percentage
- **move_to_next_stage()** - Move submission to the next workflow stage
- **calculate_guideline_score()** - Calculate overall guideline score
- **get_compliance_progress()** - Get compliance check progress
- **create_audit_log()** - Create audit log entries
- **get_submissions_by_stage()** - Get submissions with pagination

## Setup Instructions

### Prerequisites

1. PostgreSQL 12+ installed and running
2. psql command-line tool available
3. Database user with appropriate permissions

### Quick Setup

1. **Make the setup script executable:**
   \`\`\`bash
   chmod +x run_setup.sh
   \`\`\`

2. **Set environment variables (optional):**
   \`\`\`bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=insurance_dashboard
   export DB_USER=postgres
   \`\`\`

3. **Run the setup script:**
   \`\`\`bash
   ./run_setup.sh
   \`\`\`

### Manual Setup

If you prefer to run the scripts manually:

\`\`\`bash
# 1. Create database (if needed)
createdb insurance_dashboard

# 2. Run scripts in order
psql -d insurance_dashboard -f 01_create_tables.sql
psql -d insurance_dashboard -f 02_insert_dummy_data.sql
psql -d insurance_dashboard -f 03_create_views.sql
psql -d insurance_dashboard -f 04_create_functions.sql
psql -d insurance_dashboard -f 05_setup_permissions.sql
\`\`\`

### Azure PostgreSQL Setup

For Azure PostgreSQL Flexible Server:

1. **Create the database in Azure Portal or CLI**
2. **Update connection parameters:**
   \`\`\`bash
   export DB_HOST=your-server.postgres.database.azure.com
   export DB_PORT=5432
   export DB_NAME=insurance_dashboard
   export DB_USER=your_admin_user
   \`\`\`
3. **Run the setup script with SSL:**
   \`\`\`bash
   PGSSLMODE=require ./run_setup.sh
   \`\`\`

## Environment Variables

Add the following to your `.env.local` file:

\`\`\`env
POSTGRES_URL=postgresql://username:password@host:port/database_name
\`\`\`

For Azure PostgreSQL:
\`\`\`env
POSTGRES_URL=postgresql://admin_user:password@server.postgres.database.azure.com:5432/insurance_dashboard?sslmode=require
\`\`\`

## Sample Data

The dummy data includes:

- **11 submissions** across all workflow stages
- **5 missing data items** for submissions requiring information
- **2 duplicate submission records** with match confidence scores
- **12 compliance checks** with various statuses
- **12 guideline checks** with scores and evaluations
- **5 pending actions** with different priorities
- **3 email drafts** for different scenarios

## Security Considerations

1. **Change default passwords** - Never use default passwords in production
2. **Use SSL connections** - Always enable SSL for production databases
3. **Limit permissions** - Grant only necessary permissions to application users
4. **Enable audit logging** - Use the audit_log table to track changes
5. **Regular backups** - Set up automated backups for production data

## Troubleshooting

### Common Issues

1. **Permission denied errors:**
   - Ensure the database user has appropriate permissions
   - Check if the database exists and is accessible

2. **Connection refused:**
   - Verify PostgreSQL is running
   - Check host, port, and firewall settings

3. **SSL connection errors (Azure):**
   - Add `?sslmode=require` to your connection string
   - Ensure your client supports SSL connections

### Useful Commands

\`\`\`bash
# Check database connection
psql -h host -p port -U user -d database -c "SELECT version();"

# List all tables
psql -d insurance_dashboard -c "\dt"

# Check table row counts
psql -d insurance_dashboard -c "
SELECT schemaname,tablename,n_tup_ins as inserted_rows 
FROM pg_stat_user_tables 
ORDER BY n_tup_ins DESC;"

# View recent submissions
psql -d insurance_dashboard -c "SELECT * FROM recent_activity LIMIT 5;"
\`\`\`

## Next Steps

After setting up the database:

1. **Install Node.js dependencies:**
   \`\`\`bash
   npm install pg @types/pg
   \`\`\`

2. **Update your Next.js application** with the database connection string

3. **Test the connection** by running your Next.js application:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Verify data loading** by checking the dashboard pages

## Support

If you encounter any issues with the database setup, please check:

1. PostgreSQL server logs
2. Network connectivity
3. User permissions
4. SSL configuration (for Azure)

For additional help, refer to the PostgreSQL documentation or Azure PostgreSQL documentation for cloud deployments.
