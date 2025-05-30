import logging
import os
import re
import psycopg2
from datetime import datetime
from azure.storage.blob import BlobServiceClient
import azure.functions as func
from shared_code import save_to_database, is_submission_complete

# Remove this line: app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)
# Remove the @app.function_name and @app.route decorators

def process_email_body_impl(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("📧 ProcessEmailBody function triggered")
    
    try:
        # Get blob filename from request
        body = req.get_json()
        blob_filename = body.get("blob_filename")
        
        if not blob_filename:
            return func.HttpResponse("Missing blob filename", status_code=400)

        # Connect to blob storage
        blob_service = BlobServiceClient.from_connection_string(os.environ["AzureWebJobsStorage"])
        
        # Get email content
        mail_container = blob_service.get_container_client("mailbody")
        mail_blob = mail_container.get_blob_client(blob_filename)
        mail_data = mail_blob.download_blob().readall().decode("utf-8")
        
        logging.info(f"Email body content length: {len(mail_data)}")
        logging.info(f"Sample content: {mail_data[:80]}...")
        
        # Extract subject from email
        subject = ""
        subject_match = re.search(r'Subject:(.+?)(?:\r?\n|\Z)', mail_data)
        if subject_match:
            subject = subject_match.group(1).strip()
            logging.info(f"Email subject: {subject}")
            
        # Extract data from email body
        submission_data = extract_data_from_email(mail_data)
        
        # Check if we have enough data to save
        if is_submission_complete(submission_data):
            logging.info("Found complete submission data in email body")
            
            # Add metadata
            submission_data["source_file"] = blob_filename
            submission_data["submitted_at"] = datetime.utcnow()
            
            # Save to database
            save_to_database(submission_data)
            return func.HttpResponse("Successfully processed submission from email body", status_code=200)
        else:
            return func.HttpResponse("Insufficient data in email body", status_code=400)
        
    except Exception as e:
        logging.error(f"❌ Exception: {str(e)}")
        import traceback
        logging.error(f"Exception traceback: {traceback.format_exc()}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)

def extract_data_from_email(email_text):
    """Extract structured submission data from email body with enhanced parsing"""
    data = {}
    
    # Primary field patterns (direct "Field:" format)
    primary_patterns = {
        'broker': r'(?:^|\n)(?:Broker|Insurance Broker)[:;]\s*([^\n]+)',
        'insured': r'(?:^|\n)(?:Insured|Client|Company|Name)[:;]\s*([^\n]+)',
        'address': r'(?:^|\n)(?:Address|Location|Property Address)[:;]\s*([^\n]+)',
        'building_type': r'(?:^|\n)(?:Building Type|Property Type|Type)[:;]\s*([^\n]+)',
        'construction': r'(?:^|\n)Construction[:;]\s*([^\n]+)',
        'year_built': r'(?:^|\n)Year Built[:;]\s*(\d{4})',
        'area': r'(?:^|\n)(?:Area|Square Footage|Size|Surface Area)[:;]\s*(\d[\d,.]*)(?:\s*(?:sq\.?|square)?\s*(?:ft|m|feet|meters|m²|sqm))?',
        'stories': r'(?:^|\n)(?:Stories|Floors|No\. of Floors|Number of Floors)[:;]\s*(\d+)',
        'occupancy': r'(?:^|\n)Occupancy[:;]\s*([^\n]+)',
        'sprinklers': r'(?:^|\n)Sprinklers[:;]\s*(Yes|No|Y|N|True|False)',
        'alarm_system': r'(?:^|\n)(?:Alarm System|Security System|Alarm)[:;]\s*([^\n]+)',
    }
    
    # Sectioned patterns (for "- Field:" format within sections)
    sectioned_patterns = {
        # Coverage section
        'building_value': r'(?:Coverage:|coverage:).*?[-•]\s*Building Value[:;]\s*\$?\s*(\d[\d,.]*)',
        'contents_value': r'(?:Coverage:|coverage:).*?[-•]\s*Contents Value[:;]\s*\$?\s*(\d[\d,.]*)',
        'business_interruption': r'(?:Coverage:|coverage:).*?[-•]\s*(?:Business Interruption|BI)[:;]\s*\$?\s*(\d[\d,.]*)',
        'deductible': r'(?:Coverage:|coverage:).*?[-•]\s*Deductible[:;]\s*\$?\s*(\d[\d,.]*)',
        
        # Risk section
        'fire_hazards': r'(?:Risk:|risk:).*?[-•]\s*Fire Hazards[:;]\s*([^\n]+)',
        'natural_disasters': r'(?:Risk:|risk:).*?[-•]\s*Natural Disasters[:;]\s*([^\n]+)',
        'security': r'(?:Risk:|risk:).*?[-•]\s*Security[:;]\s*([^\n]+)',
        
        # Financials section
        'property_valuation': r'(?:Financials:|financials:).*?[-•]\s*Property Valuation[:;]\s*\$?\s*(\d[\d,.]*)',
        'annual_revenue': r'(?:Financials:|financials:).*?[-•]\s*(?:Annual Revenue|Revenue|Annual Turnover)[:;]\s*\$?\s*(\d[\d,.]*)'
    }
    
    # Extract primary fields first
    for field, pattern in primary_patterns.items():
        match = re.search(pattern, email_text, re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            
            # Handle special field types
            if field == 'sprinklers':
                data[field] = value.lower() in ['yes', 'true', 'y', '1']
            elif field in ['area', 'stories', 'year_built']:
                clean_value = re.sub(r'[^\d.]', '', value)
                data[field] = int(clean_value) if clean_value.isdigit() else clean_value
            else:
                data[field] = value
    
    # Extract sectioned fields using multiline regex with DOTALL flag
    for field, pattern in sectioned_patterns.items():
        match = re.search(pattern, email_text, re.IGNORECASE | re.DOTALL)
        if match:
            value = match.group(1).strip()
            
            # Handle monetary values
            if field in ['building_value', 'contents_value', 'business_interruption', 
                        'deductible', 'property_valuation', 'annual_revenue']:
                # Remove commas and dollar signs, keep only digits and decimal points
                clean_value = re.sub(r'[^\d.]', '', value)
                try:
                    data[field] = float(clean_value) if '.' in clean_value else int(clean_value)
                except ValueError:
                    data[field] = value  # Keep original if conversion fails
            else:
                data[field] = value
    
    # Fallback: Line-by-line parsing for any missed fields
    if len(data) < 10:  # If we haven't found enough data, try line-by-line
        lines = email_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect sections
            if line.lower().startswith('coverage:'):
                current_section = 'coverage'
                continue
            elif line.lower().startswith('risk:'):
                current_section = 'risk'
                continue
            elif line.lower().startswith('financials:'):
                current_section = 'financials'
                continue
            
            # Parse bullet points within sections
            bullet_match = re.search(r'^[-•]\s*([^:]+):\s*(.+)$', line)
            if bullet_match and current_section:
                key = bullet_match.group(1).strip().lower()
                value = bullet_match.group(2).strip()
                
                # Map field names based on section and key
                field_mapping = {
                    'coverage': {
                        'building value': 'building_value',
                        'contents value': 'contents_value',
                        'business interruption': 'business_interruption',
                        'deductible': 'deductible'
                    },
                    'risk': {
                        'fire hazards': 'fire_hazards',
                        'natural disasters': 'natural_disasters',
                        'security': 'security'
                    },
                    'financials': {
                        'property valuation': 'property_valuation',
                        'annual revenue': 'annual_revenue',
                        'annual turnover': 'annual_revenue'
                    }
                }
                
                if current_section in field_mapping and key in field_mapping[current_section]:
                    field = field_mapping[current_section][key]
                    
                    # Process monetary values
                    if field in ['building_value', 'contents_value', 'business_interruption', 
                                'deductible', 'property_valuation', 'annual_revenue']:
                        clean_value = re.sub(r'[^\d.]', '', value)
                        try:
                            data[field] = float(clean_value) if '.' in clean_value else int(clean_value)
                        except ValueError:
                            data[field] = value
                    else:
                        data[field] = value
            
            # Also try direct "Key: Value" pattern for any line
            colon_match = re.search(r'^([^:]+):\s*(.+)$', line)
            if colon_match:
                key = colon_match.group(1).strip().lower()
                value = colon_match.group(2).strip()
                
                # Standard field mapping
                field_mapping = {
                    'broker': 'broker', 'insurance broker': 'broker',
                    'insured': 'insured', 'client': 'insured', 'name': 'insured', 'company': 'insured',
                    'address': 'address', 'location': 'address', 'property address': 'address',
                    'building type': 'building_type', 'property type': 'building_type', 'type': 'building_type',
                    'construction': 'construction',
                    'year built': 'year_built', 'year': 'year_built',
                    'area': 'area', 'square footage': 'area', 'size': 'area', 'surface area': 'area',
                    'stories': 'stories', 'floors': 'stories', 'number of floors': 'stories',
                    'occupancy': 'occupancy',
                    'sprinklers': 'sprinklers',
                    'alarm system': 'alarm_system', 'security system': 'alarm_system'
                }
                
                if key in field_mapping:
                    field = field_mapping[key]
                    
                    # Process value based on field type
                    if field == 'sprinklers':
                        data[field] = value.lower() in ['yes', 'true', 'y', '1']
                    elif field in ['area', 'stories', 'year_built']:
                        clean_value = re.sub(r'[^\d.]', '', value)
                        try:
                            data[field] = int(clean_value) if clean_value.isdigit() else clean_value
                        except ValueError:
                            data[field] = value
                    else:
                        data[field] = value
    
    return data