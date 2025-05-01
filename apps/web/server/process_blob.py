import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.schema import EmailRecord
from azure.storage.blob import BlobServiceClient

# Config
AZURE_CONNECTION_STRING = "<your real key here>"  # or load from env
BLOB_CONTAINER = "mailbody"
DATABASE_URL = "postgresql://insureuser:insurepass@localhost:5432/insureflow"

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def download_blob_to_text(blob_name):
    blob_service = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container_client = blob_service.get_container_client(BLOB_CONTAINER)
    blob_client = container_client.get_blob_client(blob_name)
    return blob_client.download_blob().readall().decode("utf-8")

def extract_subject_from_blob_name(blob_name):
    match = re.match(r"Body_\d{8}-\d{6}-\d{3}_(.+?)_<", blob_name)
    if match:
        return match.group(1).replace("_", " ")
    return "(no subject)"

def process_blob(blob_name):
    session = Session()
    subject = extract_subject_from_blob_name(blob_name)

    if session.query(EmailRecord).filter_by(message_id=blob_name).first():
        print(f"⚠️ Already processed: {blob_name}")
        session.close()
        return

    is_reply = subject.lower().startswith("re:")
    base_subject = subject[3:].strip() if is_reply else subject
    original = None

    if is_reply:
        print(f"↪️ Detected reply. Searching for original matching: {base_subject}")
        original = session.query(EmailRecord)\
            .filter(EmailRecord.subject.ilike(f"%{base_subject}%"))\
            .order_by(EmailRecord.id.desc()).first()

    new_email = EmailRecord(
        message_id=blob_name,
        subject=subject,
        blob_name=blob_name,
        stage="stage4" if original else "stage1",
        status="new",
        original_submission_id=original.message_id if original else None,
        stage1_done=original.stage1_done if original else False,
        stage2_done=original.stage2_done if original else False,
        stage3_done=original.stage3_done if original else False
    )

    session.add(new_email)
    session.commit()
    session.close()
    print(f"✅ Saved email: {subject} (reply: {is_reply})")
