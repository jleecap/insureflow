"""
Updated implementation of the InsuranceAgentSystem class using the new Settings API
"""

import os
import logging
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.core.settings import Settings
from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
from azure.ai.openai import AzureOpenAI
from azure.ai.openai.embedding import AzureOpenAIEmbedding

def setup_llm_and_embeddings(self):
    """Configure the LLM and embedding models"""
    self.llm = AzureOpenAI(
        model="gpt-4o",
        deployment_name="gpt-4o",
        api_key=AZURE_OPENAI_API_KEY,
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_version=AZURE_GPT_API_VERSION,
        temperature=0.1,
        timeout=60,
    )
    
    self.embed_model = AzureOpenAIEmbedding(
        model="text-embedding-ada-002",
        deployment_name="text-embedding-ada-002",
        api_key=AZURE_OPENAI_API_KEY,
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_version=AZURE_EMBEDDING_API_VERSION,
    )
    
    # Set as default models
    Settings.llm = self.llm
    Settings.embed_model = self.embed_model
    
    logger.info("LLM and embedding models initialized")

def setup_guidelines_vector_store(self):
    """Initialize the guidelines vector store from the PDF"""
    try:
        # Define paths
        pdf_path = "experiments/data/UW Commercial Insurance Manual.pdf"
        persist_dir = "experiments/storage/guidelines_index"
        
        # Check if index already exists
        if os.path.exists(persist_dir) and os.listdir(persist_dir):
            logger.info(f"Loading existing index from {persist_dir}")
            storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
            self.guidelines_index = VectorStoreIndex.from_storage_context(storage_context)
        else:
            # Load and process PDF if needed
            logger.info(f"Loading PDF document from {pdf_path}")
            pdf_reader = PDFReader()
            documents = pdf_reader.load_data(pdf_path)
            logger.info(f"Loaded {len(documents)} documents from PDF")
            
            # Configure settings with node parser
            Settings.node_parser = SentenceSplitter(
                chunk_size=1024,
                chunk_overlap=200,
                separator=" ",
                paragraph_separator="\n\n",
            )
            
            # Create index
            logger.info("Creating vector store index...")
            self.guidelines_index = VectorStoreIndex.from_documents(documents)
            logger.info("Successfully created index")
            
            # Persist the index
            os.makedirs(persist_dir, exist_ok=True)
            logger.info(f"Persisting index to {persist_dir}")
            self.guidelines_index.storage_context.persist(persist_dir=persist_dir)
            logger.info("Successfully persisted index")
        
        # Create retriever
        self.guidelines_retriever = self.guidelines_index.as_retriever(similarity_top_k=3)
        logger.info("Guidelines vector store initialized successfully")
    except Exception as e:
        logger.error(f"Error setting up guidelines vector store: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        self.guidelines_index = None
        self.guidelines_retriever = None
        logger.warning("Using mock guidelines data as fallback") 