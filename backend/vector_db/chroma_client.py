"""
ChromaDB singleton client — persists embeddings between requests.
"""
import os
import chromadb
from chromadb.config import Settings

_client: chromadb.PersistentClient = None


def init_chroma_client() -> chromadb.PersistentClient:
    global _client
    persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./vector_db/chroma_store")
    os.makedirs(persist_dir, exist_ok=True)
    _client = chromadb.PersistentClient(
        path=persist_dir,
        settings=Settings(anonymized_telemetry=False),
    )
    return _client


def get_chroma_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = init_chroma_client()
    return _client


def get_or_create_collection(collection_name: str = "travel_guides"):
    """Get or create the main travel guides collection."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )
