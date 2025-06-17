import logging
import os
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

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
cursor.execute("""SELECT "broker", "insured", "address", "building_type", "construction", 
               "year_built", "area", "stories", "occupancy", "sprinklers", "alarm_system", 
               "building_value", "contents_value", "business_interruption", "deductible", 
               "fire_hazards", "natural_disasters", "security", "property_valuation", 
               "annual_revenue", "source_file", "submitted_at" 
               FROM submissions ORDER BY submitted_at DESC LIMIT 1""")

# Fetch the last row from the executed query
row = cursor.fetchone()

# Extracting values from the row
fields = ["broker", "insured", "address", "building_type", "construction", 
        "year_built", "area", "stories", "occupancy", "sprinklers", "alarm_system", 
        "building_value", "contents_value", "business_interruption", "deductible", 
        "fire_hazards", "natural_disasters", "security", "property_valuation", 
        "annual_revenue", "source_file", "submitted_at"]

initial_data = {fields[i]: row[i] for i in range(len(fields))}