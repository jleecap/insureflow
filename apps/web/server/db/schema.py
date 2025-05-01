from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class EmailRecord(Base):
    __tablename__ = 'email_records'

    id = Column(Integer, primary_key=True)
    message_id = Column(String, unique=True, nullable=False)
    subject = Column(String)
    received_at = Column(DateTime)
    blob_name = Column(String, nullable=False)
    stage = Column(String, default="stage1")
    status = Column(String, default="new")

    # Reply-tracking and stage flags
    original_submission_id = Column(String)  # message_id of the original email
    stage1_done = Column(Boolean, default=False)
    stage2_done = Column(Boolean, default=False)
    stage3_done = Column(Boolean, default=False)
    stage4_done = Column(Boolean, default=False)

 # e.g., processed, ignored
