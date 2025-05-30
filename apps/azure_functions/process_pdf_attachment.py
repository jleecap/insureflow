import logging
import os
import re
import io
import psycopg2
from datetime import datetime
from azure.storage.blob import BlobServiceClient
import azure.functions as func
import PyPDF2
from shared_code import save_to_database, is_submission_complete

# Remove this line: app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)
# Remove the @app.function_name and @app.route decorators

def process_pdf_attachment_impl(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("📎 ProcessPDFAttachment function triggered")
    
    try:
        # Get request data
        body = req.get_json()
        blob_filename = body.get("attachment_filename")
        
        if not blob_filename:
            return func.HttpResponse("Missing attachment filename", status_code=400)

        # Connect to blob storage
        blob_service = BlobServiceClient.from_connection_string(os.environ["AzureWebJobsStorage"])
        
        # Get the PDF content
        att_container = blob_service.get_container_client("attachments")
        pdf_blob = att_container.get_blob_client(blob_filename)
        pdf_content = pdf_blob.download_blob().readall()
        
        logging.info(f"Processing PDF: {blob_filename}")
        
        # Extract data from PDF
        pdf_data = extract_data_from_pdf(pdf_content)
        
        # Check if we have enough data
        if is_submission_complete(pdf_data):
            # Add metadata
            pdf_data["source_file"] = blob_filename
            pdf_data["submitted_at"] = datetime.utcnow()
            
            # Save to database
            save_to_database(pdf_data)
            return func.HttpResponse("Successfully processed submission from PDF attachment", status_code=200)
        else:
            # Debug - log what was extracted
            for key, value in pdf_data.items():
                logging.info(f"  {key}: {value}")
                
            return func.HttpResponse("Incomplete data in PDF attachment - could not extract all required fields", status_code=400)
    
    except Exception as e:
        logging.error(f"❌ Exception: {str(e)}")
        import traceback
        logging.error(f"Exception traceback: {traceback.format_exc()}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)

def extract_data_from_pdf(pdf_content):
    """Extract structured data from PDF content - handles both direct and sectioned formats"""
    try:
        # Create PDF reader
        pdf_file = io.BytesIO(pdf_content)
        reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        text = ""
        for page in range(len(reader.pages)):
            page_text = reader.pages[page].extract_text()
            text += page_text + "\n"
        
        logging.info(f"Extracted {len(text)} characters from PDF")
        logging.debug(f"Raw PDF content: {text[:500]}...")
        
        # Clean the text
        text = clean_pdf_text(text)
        logging.debug(f"Cleaned PDF content: {text[:500]}...")
        
        data = {}
        
        # PHASE 1: Extract direct field format (Field: Value)
        direct_patterns = {
            'broker': r'Broker:\s*([^\n\r]+?)(?=\s*(?:Insured:|Address:|Building|$))',
            'insured': r'Insured:\s*([^\n\r]+?)(?=\s*(?:Address:|Building|Construction|$))',
            'address': r'Address:\s*([^\n\r]+?)(?=\s*(?:Building\s+Type:|Construction:|Year|$))',
            'building_type': r'Building\s+Type:\s*([^\n\r]+?)(?=\s*(?:Construction:|Year|Area|$))',
            'construction': r'Construction:\s*([^\n\r]+?)(?=\s*(?:Year\s+Built:|Area:|Stories|$))',
            'year_built': r'Year\s+Built:\s*(\d{4})(?=\s*(?:Area:|Stories:|Occupancy|$))',
            'area': r'Area:\s*(\d[\d,.\s]*?)(?:\s*sqm|\s*sq\.?\s*m|\s*square\s+meters?)?(?=\s*(?:Stories:|Occupancy:|Sprinklers|$))',
            'stories': r'Stories:\s*(\d+)(?=\s*(?:Occupancy:|Sprinklers:|Alarm|$))',
            'occupancy': r'Occupancy:\s*([^\n\r]+?)(?=\s*(?:Sprinklers:|Alarm|Coverage|$))',
            'sprinklers': r'Sprinklers:\s*(Yes|No|Y|N|True|False)(?=\s*(?:Alarm|Coverage|Risk|$))',
            'alarm_system': r'Alarm\s+System:\s*([^\n\r]+?)(?=\s*(?:Coverage:|Risk:|Financials|$))',
        }
        
        # Extract direct format fields
        for field, pattern in direct_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                value = match.group(1).strip()
                logging.debug(f"Direct extraction - {field}: {value}")
                
                # Process the value based on field type
                if field == 'sprinklers':
                    data[field] = value.lower() in ['yes', 'true', 'y', '1']
                elif field in ['area', 'stories', 'year_built']:
                    clean_value = re.sub(r'[^\d.]', '', value)
                    try:
                        data[field] = int(clean_value) if clean_value.isdigit() else value
                    except ValueError:
                        data[field] = value
                else:
                    data[field] = value
            else:
                logging.debug(f"Direct extraction - {field}: NOT FOUND")
        
        # PHASE 2: Extract sectioned format (Coverage:, Risk:, Financials:)
        sectioned_patterns = {
            # Coverage section
            'building_value': r'Coverage:.*?[-•]\s*Building\s+Value:\s*\$?\s*(\d[\d,.]*)',
            'contents_value': r'Coverage:.*?[-•]\s*Contents\s+Value:\s*\$?\s*(\d[\d,.]*)',
            'business_interruption': r'Coverage:.*?[-•]\s*Business\s+Interruption:\s*\$?\s*(\d[\d,.]*)',
            'deductible': r'Coverage:.*?[-•]\s*Deductible:\s*\$?\s*(\d[\d,.]*)',
            
            # Risk section
            'fire_hazards': r'Risk:.*?[-•]\s*Fire\s+Hazards:\s*([^\n\r]+?)(?=\s*[-•]|\s*\n[A-Z]|\s*$)',
            'natural_disasters': r'Risk:.*?[-•]\s*Natural\s+Disasters:\s*([^\n\r]+?)(?=\s*[-•]|\s*\n[A-Z]|\s*$)',
            'security': r'Risk:.*?[-•]\s*Security:\s*([^\n\r]+?)(?=\s*[-•]|\s*\n[A-Z]|\s*$)',
            
            # Financials section
            'property_valuation': r'Financials:.*?[-•]\s*Property\s+Valuation:\s*\$?\s*(\d[\d,.]*)',
            'annual_revenue': r'Financials:.*?[-•]\s*Annual\s+Revenue:\s*\$?\s*(\d[\d,.]*)'
        }
        
        # Extract sectioned fields using multiline regex with DOTALL flag
        for field, pattern in sectioned_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
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
        
        # PHASE 3: Fallback line-by-line parsing for any missed fields
        if len(data) < 15:  # If we haven't found most fields, try line-by-line
            logging.info("Trying fallback line-by-line extraction")
            fallback_data = extract_fallback_pdf_fields(text)
            
            # Merge fallback data (don't overwrite existing good data)
            for key, value in fallback_data.items():
                if key not in data or not data[key]:
                    data[key] = value
        
        # PHASE 4: Final validation and cleanup
        data = validate_pdf_data(data)
        
        logging.info(f"Extracted {len(data)} fields from PDF")
        for key, value in data.items():
            logging.info(f"  {key}: {value}")
            
        return data
    
    except Exception as e:
        logging.error(f"Error extracting data from PDF: {str(e)}")
        import traceback
        logging.error(f"Exception traceback: {traceback.format_exc()}")
        return {}

def clean_pdf_text(text):
    """Clean and normalize PDF text for better parsing"""
    # CRITICAL FIX: Add line breaks before field labels when they're concatenated
    field_labels = [
        'Insured:', 'Address:', 'Building Type:', 'Construction:', 'Year Built:', 
        'Area:', 'Stories:', 'Occupancy:', 'Sprinklers:', 'Alarm System:',
        'Coverage:', 'Risk:', 'Financials:'
    ]
    
    # Add newlines before field labels that are concatenated
    for label in field_labels:
        text = re.sub(f'(\\w+)\\s+{re.escape(label)}', f'\\1\n{label}', text)
    
    # Normalize line breaks and spacing
    text = re.sub(r'\r\n?', '\n', text)  # Convert all line breaks to \n
    text = re.sub(r'[ \t]+', ' ', text)  # Normalize spaces and tabs
    
    # Fix common PDF extraction spacing issues
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
    text = re.sub(r'(\d)([A-Za-z])', r'\1 \2', text)  # Add space between number and letter
    text = re.sub(r'([A-Za-z])(\d)', r'\1 \2', text)  # Add space between letter and number
    
    return text.strip()

def extract_fallback_pdf_fields(text):
    """Fallback extraction using line-by-line approach for PDF"""
    data = {}
    
    lines = text.split('\n')
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
                    'annual revenue': 'annual_revenue'
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
        elif ':' in line and not line.startswith('-') and not line.startswith('•'):
            colon_match = re.search(r'^([^:]+):\s*(.+)$', line)
            if colon_match:
                key = colon_match.group(1).strip().lower()
                value = colon_match.group(2).strip()
                
                # Standard field mapping
                field_mapping = {
                    'broker': 'broker',
                    'insured': 'insured',
                    'address': 'address',
                    'building type': 'building_type',
                    'construction': 'construction',
                    'year built': 'year_built',
                    'area': 'area',
                    'stories': 'stories',
                    'occupancy': 'occupancy',
                    'sprinklers': 'sprinklers',
                    'alarm system': 'alarm_system'
                }
                
                if key in field_mapping:
                    field = field_mapping[key]
                    
                    # Process value based on field type
                    if field == 'sprinklers':
                        data[field] = value.lower() in ['yes', 'true', 'y', '1']
                    elif field in ['area', 'stories', 'year_built']:
                        clean_value = re.sub(r'[^\d.]', '', value)
                        try:
                            data[field] = int(clean_value) if clean_value.isdigit() else value
                        except ValueError:
                            data[field] = value
                    else:
                        data[field] = value
    
    return data

def validate_pdf_data(data):
    """Final validation and cleanup of extracted PDF data"""
    cleaned_data = {}
    
    for key, value in data.items():
        if value is not None and str(value).strip():
            # Clean string values
            if isinstance(value, str):
                value = value.strip()
                
                # Remove field labels that might have been included
                labels_to_remove = ['Building Type', 'Construction', 'Coverage', 'Risk', 'Financials']
                for label in labels_to_remove:
                    if value.endswith(label):
                        value = value[:-len(label)].strip()
                
                # Skip empty values after cleaning
                if not value:
                    continue
            
            cleaned_data[key] = value
    
    return cleaned_data