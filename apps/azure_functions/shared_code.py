import logging
import os
import psycopg2
from datetime import datetime

def is_submission_complete(data):
    """Check if submission data is complete enough to save"""
    if not data:
        return False
        
    # Check for minimum required fields
    essential_fields = ["insured", "address", "building_type"]
    missing_essential = [field for field in essential_fields if field not in data or not data[field]]
    
    if missing_essential:
        logging.warning(f"Missing essential fields: {', '.join(missing_essential)}")
        return False
    
    # Need at least 7 fields in total
    if len(data) < 7:
        logging.warning(f"Insufficient fields: only {len(data)} fields found, need at least 7")
        return False
        
    return True

def save_to_database(data):
    """Save structured data to PostgreSQL database"""
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(
            dbname=os.getenv("PG_DB"),
            user=os.getenv("PG_USER"),
            password=os.getenv("PG_PASSWORD"),
            host=os.getenv("PG_HOST"),
            port=os.getenv("PG_PORT"),
            sslmode=os.getenv("PG_SSLMODE")
        )
        cursor = conn.cursor()
        
        # Ensure all required fields exist (with NULL values if missing)
        required_fields = [
            "broker", "insured", "address", "building_type", "construction", "year_built",
            "area", "stories", "occupancy", "sprinklers", "alarm_system",
            "building_value", "contents_value", "business_interruption", "deductible",
            "fire_hazards", "natural_disasters", "security", "property_valuation",
            "annual_revenue", "source_file", "submitted_at"
        ]
        
        # Add NULL for missing fields
        for field in required_fields:
            if field not in data:
                data[field] = None
                
        # Log data to be inserted
        for key, value in data.items():
            logging.info(f"{key}: {value} ({type(value)})")
        
        # Insert into database
        cursor.execute("""
            INSERT INTO submissions (
                broker, insured, address, building_type, construction, year_built,
                area, stories, occupancy, sprinklers, alarm_system,
                building_value, contents_value, business_interruption, deductible,
                fire_hazards, natural_disasters, security, property_valuation,
                annual_revenue, source_file, submitted_at
            ) VALUES (
                %(broker)s, %(insured)s, %(address)s, %(building_type)s, %(construction)s,
                %(year_built)s, %(area)s, %(stories)s, %(occupancy)s, %(sprinklers)s,
                %(alarm_system)s, %(building_value)s, %(contents_value)s,
                %(business_interruption)s, %(deductible)s, %(fire_hazards)s,
                %(natural_disasters)s, %(security)s, %(property_valuation)s,
                %(annual_revenue)s, %(source_file)s, %(submitted_at)s
            )
        """, data)
        conn.commit()
        
        logging.info("Successfully inserted submission data into database")
        return True
    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        return False
    finally:
        if 'conn' in locals():
            if 'cursor' in locals():
                cursor.close()
            conn.close()