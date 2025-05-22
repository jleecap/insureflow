import os
import logging
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.core.settings import Settings
from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_vector_store():
    try:
        # Define paths
        pdf_path = "experiments/data/UW Commercial Insurance Manual.pdf"
        persist_dir = "experiments/storage/guidelines_index"
        
        # Create storage directory
        os.makedirs(persist_dir, exist_ok=True)
        logger.info(f"Created/verified storage directory at {persist_dir}")
        
        # Initialize LLM and embedding models
        llm = AzureOpenAI(
            model="gpt-4",
            deployment_name="gpt-4",
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_version=os.getenv('AZURE_GPT_API_VERSION', '2025-01-01-preview'),
            temperature=0.1
        )
        
        embed_model = AzureOpenAIEmbedding(
            model="text-embedding-ada-002",
            deployment_name="text-embedding-ada-002",
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_version=os.getenv('AZURE_EMBEDDING_API_VERSION', '2023-12-01-preview')
        )
        
        # Configure settings
        Settings.llm = llm
        Settings.embed_model = embed_model
        Settings.node_parser = SentenceSplitter(
            chunk_size=1024,
            chunk_overlap=200,
            separator=" ",
            paragraph_separator="\n\n"
        )
        
        # Load PDF
        logger.info(f"Loading PDF from {pdf_path}")
        pdf_reader = PDFReader()
        documents = pdf_reader.load_data(pdf_path)
        logger.info(f"Loaded {len(documents)} documents from PDF")
        
        # Create and persist index
        logger.info("Creating vector store index...")
        index = VectorStoreIndex.from_documents(documents)
        logger.info("Successfully created index")
        
        # Persist index
        logger.info(f"Persisting index to {persist_dir}")
        index.storage_context.persist(persist_dir=persist_dir)
        logger.info("Successfully persisted index")
        
        # Test retrieval
        retriever = index.as_retriever(similarity_top_k=3)
        results = retriever.retrieve("What are the underwriting guidelines?")
        logger.info(f"Retrieved {len(results)} results")
        
        return True
        
    except Exception as e:
        logger.error(f"Error in test_vector_store: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    test_vector_store() 