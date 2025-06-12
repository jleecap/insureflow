import os
import logging
import traceback
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.core.settings import Settings
from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def debug_vector_store():
    try:
        # Check environment variables
        required_env_vars = [
            'AZURE_OPENAI_API_KEY',
            'AZURE_OPENAI_ENDPOINT',
            'AZURE_GPT_API_VERSION',
            'AZURE_EMBEDDING_API_VERSION'
        ]
        
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        logger.info("All required environment variables are present")
        
        # Define paths
        pdf_path = "experiments/data/UW Commercial Insurance Manual.pdf"
        persist_dir = "experiments/storage/guidelines_index"
        
        # Check PDF file
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found at: {pdf_path}")
        logger.info(f"PDF file exists at: {pdf_path}")
        
        # Check storage directory
        os.makedirs(persist_dir, exist_ok=True)
        logger.info(f"Storage directory exists at: {persist_dir}")
        
        # Initialize LLM
        logger.info("Initializing LLM...")
        llm = AzureOpenAI(
            model="gpt-4",
            deployment_name="gpt-4",
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_version=os.getenv('AZURE_GPT_API_VERSION', '2025-01-01-preview'),
            temperature=0.1
        )
        logger.info("LLM initialized successfully")
        
        # Initialize embedding model
        logger.info("Initializing embedding model...")
        embed_model = AzureOpenAIEmbedding(
            model="text-embedding-ada-002",
            deployment_name="text-embedding-ada-002",
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_version=os.getenv('AZURE_EMBEDDING_API_VERSION', '2023-12-01-preview')
        )
        logger.info("Embedding model initialized successfully")
        
        # Configure settings
        logger.info("Configuring settings...")
        Settings.llm = llm
        Settings.embed_model = embed_model
        Settings.node_parser = SentenceSplitter(
            chunk_size=1024,
            chunk_overlap=200,
            separator=" ",
            paragraph_separator="\n\n"
        )
        logger.info("Settings configured successfully")
        
        # Load PDF
        logger.info(f"Loading PDF from {pdf_path}")
        pdf_reader = PDFReader()
        documents = pdf_reader.load_data(pdf_path)
        logger.info(f"Loaded {len(documents)} documents from PDF")
        
        # Create index
        logger.info("Creating vector store index...")
        index = VectorStoreIndex.from_documents(documents)
        logger.info("Successfully created index")
        
        # Persist index
        logger.info(f"Persisting index to {persist_dir}")
        index.storage_context.persist(persist_dir=persist_dir)
        logger.info("Successfully persisted index")
        
        # Test retrieval
        logger.info("Testing retrieval...")
        retriever = index.as_retriever(similarity_top_k=3)
        results = retriever.retrieve("What are the underwriting guidelines?")
        logger.info(f"Retrieved {len(results)} results")
        
        return True
        
    except Exception as e:
        logger.error(f"Error in debug_vector_store: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    debug_vector_store() 