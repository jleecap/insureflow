#!/bin/bash

# Database setup script for Insurance Dashboard
# This script runs all SQL files in the correct order

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-insurance_dashboard}"
DB_USER="${DB_USER:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Insurance Dashboard Database...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}Running $description...${NC}"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f "$file"; then
        echo -e "${GREEN}✓ $description completed successfully${NC}"
    else
        echo -e "${RED}✗ Error running $description${NC}"
        exit 1
    fi
}

# Create database if it doesn't exist (optional)
echo -e "${YELLOW}Checking if database exists...${NC}"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Creating database $DB_NAME...${NC}"
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    echo -e "${GREEN}✓ Database created successfully${NC}"
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi

# Run SQL files in order
run_sql_file "01_create_tables.sql" "Table creation"
run_sql_file "02_insert_dummy_data.sql" "Dummy data insertion"
run_sql_file "03_create_views.sql" "View creation"
run_sql_file "04_create_functions.sql" "Function creation"
run_sql_file "05_setup_permissions.sql" "Permission setup"

echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your .env file with the database connection string"
echo "2. Install the required npm packages: npm install pg @types/pg"
echo "3. Start your Next.js application: npm run dev"
echo ""
echo -e "${YELLOW}Connection string format:${NC}"
echo "POSTGRES_URL=postgresql://$DB_USER:your_password@$DB_HOST:$DB_PORT/$DB_NAME"
