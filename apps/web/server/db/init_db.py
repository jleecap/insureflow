from sqlalchemy import create_engine, text
from schema import Base

# Connect to Docker PostgreSQL
DATABASE_URL = "postgresql://insureuser:insurepass@localhost:5432/insureflow"
engine = create_engine(DATABASE_URL)

def reset_db():
    with engine.connect() as conn:
        print("⚠️ Dropping existing table if it exists...")
        conn.execute(text("DROP TABLE IF EXISTS email_records CASCADE"))
        conn.commit()

    print("✅ Creating tables with updated schema...")
    Base.metadata.create_all(engine)
    print("🎉 Done.")

if __name__ == "__main__":
    reset_db()

