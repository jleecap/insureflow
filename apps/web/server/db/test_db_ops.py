from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from schema import EmailRecord

# PostgreSQL DB connection
DATABASE_URL = "postgresql://insureuser:insurepass@localhost:5432/insureflow"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def insert_original_and_reply():
    session = Session()

    # Insert original submission email
    original_email = EmailRecord(
        message_id="<original-msg-id@broker.com>",
        subject="Insource quote - Submission",
        blob_name="mailbody/Body_20250429-170000-original.txt",
        stage="stage3",
        status="processed",
        stage1_done=True,
        stage2_done=True,
        stage3_done=True
    )
    session.add(original_email)
    session.commit()  # So it gets an ID

    # Insert reply email that references original
    reply_email = EmailRecord(
        message_id="<reply-msg-id@broker.com>",
        subject="Re: Insource quote - Submission",
        blob_name="mailbody/Body_20250430-100000-reply.txt",
        stage="stage4",
        status="new",
        original_submission_id=original_email.message_id,
        stage1_done=True,
        stage2_done=True,
        stage3_done=True
    )
    session.add(reply_email)
    session.commit()

    print("Inserted original and reply email.")
    session.close()

def list_all_emails():
    session = Session()
    emails = session.query(EmailRecord).all()
    for email in emails:
        print(f"""
        ID: {email.id}
        Message-ID: {email.message_id}
        Subject: {email.subject}
        Stage: {email.stage}
        Status: {email.status}
        Original Submission ID: {email.original_submission_id}
        Stages Done: S1={email.stage1_done}, S2={email.stage2_done}, S3={email.stage3_done}, S4={email.stage4_done}
        """)
    session.close()

if __name__ == "__main__":
    insert_original_and_reply()
    list_all_emails()
