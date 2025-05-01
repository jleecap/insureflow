from sqlalchemy import create_engine, text

# PostgreSQL DB URL from your init_db.py
DATABASE_URL = "postgresql://insureuser:insurepass@localhost:5432/insureflow"




def run_migration():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        alter_statements = [
            "ALTER TABLE email_records ADD COLUMN original_submission_id TEXT",
            "ALTER TABLE email_records ADD COLUMN stage1_done BOOLEAN DEFAULT FALSE",
            "ALTER TABLE email_records ADD COLUMN stage2_done BOOLEAN DEFAULT FALSE",
            "ALTER TABLE email_records ADD COLUMN stage3_done BOOLEAN DEFAULT FALSE",
            "ALTER TABLE email_records ADD COLUMN stage4_done BOOLEAN DEFAULT FALSE",
        ]

        for stmt in alter_statements:
            try:
                connection.execute(text(stmt))
                print(f"Executed: {stmt}")
            except Exception as e:
                if 'already exists' in str(e):
                    print(f"Column already exists, skipping: {stmt}")
                else:
                    raise

    print("PostgreSQL migration complete.")

if __name__ == "__main__":
    run_migration()

