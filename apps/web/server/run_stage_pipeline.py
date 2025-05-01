import os
import sys
import re
from azure.storage.blob import BlobServiceClient
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from db.schema import EmailRecord

# Load from .env or hardcode for now
AZURE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
BLOB_CONTAINER = "mailbody"
DATABASE_URL = "postgresql://insureuser:insurepass@localhost:5432/insureflow"

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def download_blob_to_text(blob_name):
    blob_service = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container_client = blob_service.get_container_client(BLOB_CONTAINER)
    blob_client = container_client.get_blob_client(blob_name)
    content = blob_client.download_blob().readall()
    return content.decode("utf-8")

def extract_subject_from_blob_name(blob_name):
    match = re.match(r"Body_\d{8}-\d{6}-\d{3}_(.+?)_<", blob_name)
    if match:
        return match.group(1).replace('_', ' ')
    return "(no subject)"

def process_blob(blob_name):
    print(f"📥 Processing blob: {blob_name}")
    body = download_blob_to_text(blob_name)
    subject = extract_subject_from_blob_name(blob_name)

    session = Session()

    # Check if message_id already exists
    existing = session.query(EmailRecord).filter_by(message_id=blob_name).first()
    if existing:
        print(f"⚠️ Skipping duplicate: {blob_name}")
        session.close()
        return

    email = EmailRecord(
        message_id=blob_name,
        subject=subject,
        blob_name=blob_name,
        stage="stage1",  # default for now
        status="new"
    )
    session.add(email)
    session.commit()
    session.close()
    print(f"✅ Email record saved to DB with subject: {subject}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing blob name.")
        sys.exit(1)
    blob_name = sys.argv[1]
    process_blob(blob_name)
