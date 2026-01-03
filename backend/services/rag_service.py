
import os
import chromadb
from chromadb.config import Settings
from pypdf import PdfReader
from io import BytesIO
import uuid

# Define persistence directory (relative to backend)
CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")

class RAGService:
    def __init__(self):
        # Initialize persistent Client
        self.client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        
        # Get or create collection for agent knowledge
        # Using concise distance metric (cosine is default and usually good for text)
        self.collection = self.client.get_or_create_collection(name="agent_knowledge")

    def add_document(self, agent_id: str, filename: str, file_content: bytes, file_type: str):
        """
        Processes a file (PDF or Text), chunks it, and adds embeddings to ChromaDB.
        """
        text = ""
        
        if file_type == "application/pdf":
            # Extract text from PDF
            try:
                reader = PdfReader(BytesIO(file_content))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            except Exception as e:
                print(f"Error reading PDF: {e}")
                raise ValueError("Invalid PDF file")
        elif "text" in file_type:
            # Decode text file
            try:
                text = file_content.decode("utf-8")
            except Exception as e:
                print(f"Error reading text file: {e}")
                raise ValueError("Invalid text file encoding")
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        if not text.strip():
            raise ValueError("File is empty or text could not be extracted")

        # Chunk the text
        chunks = self._chunk_text(text)
        
        # Prepare data for ChromaDB
        ids = [f"{agent_id}_{uuid.uuid4()}" for _ in chunks]
        metadatas = [{"agent_id": agent_id, "source": filename} for _ in chunks]
        
        # Add to collection
        # ChromaDB uses a default embedding model (all-MiniLM-L6-v2) if none provided
        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
        return len(chunks)

    def query(self, agent_id: str, query_text: str, n_results: int = 3):
        """
        Retrieves relevant context for a specific agent based on the query.
        """
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where={"agent_id": agent_id} # Filter by agent
        )
        
        # Flatten results (results['documents'] is a list of lists)
        documents = results['documents'][0] if results['documents'] else []
        return documents

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200):
        """
        Simple overlapping chunker.
        """
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
            
        return chunks

# Singleton instance
rag_service = RAGService()
