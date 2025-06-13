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