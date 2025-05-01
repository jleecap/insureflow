import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.schema import EmailRecord

# DB connection
DATABASE_URL = "postgresql://insureuser:insurepass@localhost:5432/insureflow"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# --- Placeholder stage execution functions ---
def run_stage1(email): print(f"🏁 Running Stage 1 for: {email.subject}")
def run_stage2(email): print(f"🔍 Running Stage 2 for: {email.subject}")
def run_stage3(email): print(f"⚙️  Running Stage 3 for: {email.subject}")
def run_stage4(email): print(f"✅ Running Stage 4 for: {email.subject}")

def update_stage_flag(session, email, stage_name):
    setattr(email, f"{stage_name}_done", True)
    session.commit()
    print(f"📝 Marked {stage_name}_done = True for email ID {email.id}")

# --- Core decision logic ---
def process_email(message_id):
    session = Session()
    email = session.query(EmailRecord).filter_by(message_id=message_id).first()

    if not email:
        print(f"❌ Email not found in DB for message_id: {message_id}")
        session.close()
        return

    print(f"\n📨 Processing email: {email.subject}\nStage: {email.stage} | Status: {email.status}")

    # Check if this is a reply
    if email.original_submission_id:
        original = session.query(EmailRecord).filter_by(message_id=email.original_submission_id).first()
        if not original:
            print(f"⚠️ Reply email has no matching original submission. Running all stages.")
        else:
            print(f"↪️ Detected reply to: {original.subject}")
            # Inherit stage flags
            email.stage1_done = original.stage1_done
            email.stage2_done = original.stage2_done
            email.stage3_done = original.stage3_done
            session.commit()

    # Run only incomplete stages
    if not email.stage1_done:
        run_stage1(email)
        update_stage_flag(session, email, "stage1")

    if not email.stage2_done:
        run_stage2(email)
        update_stage_flag(session, email, "stage2")

    if not email.stage3_done:
        run_stage3(email)
        update_stage_flag(session, email, "stage3")

    if not email.stage4_done:
        run_stage4(email)
        update_stage_flag(session, email, "stage4")

    # Final status
    email.status = "processed"
    session.commit()
    print(f"✅ Finished processing email: {email.subject}")
    session.close()

# --- Entry point ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❗ Usage: python run_stage_pipeline.py <message_id>")
        sys.exit(1)

    message_id = sys.argv[1]
    process_email(message_id)
