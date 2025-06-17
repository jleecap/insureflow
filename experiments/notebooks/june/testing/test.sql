-- Main submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage workflow_stage NOT NULL DEFAULT 'extraction',
    status submission_status NOT NULL DEFAULT 'pending',
    "broker" VARCHAR(50) UNIQUE NOT NULL,
    "insured" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "building_type" DATE NOT NULL,
    "construction" VARCHAR(100) NOT NULL,
    "year_built" INTEGER NOT NULL CHECK ("year_built" > 0),
    "area" VARCHAR(100) NOT NULL,
    "stories" DECIMAL(12, 2),
    "occupancy" TEXT,
    "sprinklers" VARCHAR(255),
    "alarm_system" VARCHAR(100),
    "building_value" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "broker" VARCHAR(255) NOT NULL, 
    "insured" VARCHAR(255) NOT NULL, 
    "address" VARCHAR(255) NOT NULL, 
    "building_type" VARCHAR(255) NOT NULL,
    "construction" VARCHAR(255) NOT NULL, 
    "year_built" VARCHAR(255) NOT NULL,
    "area" VARCHAR(255) NOT NULL, 
    "stories" VARCHAR(255) NOT NULL, 
    "occupancy" VARCHAR(255) NOT NULL, 
    "sprinklers" VARCHAR(255) NOT NULL, 
    "alarm_system" VARCHAR(255) NOT NULL,
    "building_value" VARCHAR(255) NOT NULL, 
    "contents_value" VARCHAR(255) NOT NULL, 
    "business_interruption" VARCHAR(255) NOT NULL, 
    "deductible" VARCHAR(255) NOT NULL,
    "fire_hazards" VARCHAR(255) NOT NULL, 
    "natural_disasters" VARCHAR(255) NOT NULL, 
    "security" VARCHAR(255) NOT NULL, 
    "property_valuation" VARCHAR(255) NOT NULL,
    "annual_revenue" VARCHAR(255) NOT NULL, 
    "source_file" VARCHAR(255) NOT NULL, 
    "submitted_at" DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM submissions;

"broker", "insured", "address", "building_type", "construction", "year_built",
"area", "stories", "occupancy", "sprinklers", "alarm_system",
"building_value", "contents_value", "business_interruption", "deductible",
"fire_hazards", "natural_disasters", "security", "property_valuation",
"annual_revenue", "source_file", "submitted_at"