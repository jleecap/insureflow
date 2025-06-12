import os
import logging
from PyPDF2 import PdfReader
from llama_index.readers.file import PDFReader

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_pdf_reading():
    pdf_path = "experiments/data/UW Commercial Insurance Manual.pdf"
    
    # Check if file exists
    logger.info(f"Checking if file exists at: {pdf_path}")
    if not os.path.exists(pdf_path):
        logger.error(f"File not found at: {pdf_path}")
        return
    
    # Check file permissions
    logger.info(f"File permissions: {oct(os.stat(pdf_path).st_mode)[-3:]}")
    
    try:
        # Try reading with PyPDF2
        logger.info("Attempting to read with PyPDF2...")
        pdf = PdfReader(pdf_path)
        logger.info(f"Successfully read with PyPDF2. Number of pages: {len(pdf.pages)}")
        
        # Try reading first page content
        logger.info("Attempting to read first page content...")
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        logger.info(f"First page preview: {text[:200]}...")
        
        # Try with LlamaIndex's PDFReader
        logger.info("\nAttempting to read with LlamaIndex PDFReader...")
        pdf_reader = PDFReader()
        documents = pdf_reader.load_data(pdf_path)
        logger.info(f"Successfully read with LlamaIndex PDFReader. Number of documents: {len(documents)}")
        logger.info(f"First document preview: {documents[0].text[:200]}...")
        
    except Exception as e:
        logger.error(f"Error reading PDF: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    test_pdf_reading() 