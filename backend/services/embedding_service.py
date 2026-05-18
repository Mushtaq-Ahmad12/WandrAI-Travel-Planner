"""
Embedding Service — provides robust wrapper for Gemini Embeddings,
ensuring 1-to-1 document-to-embedding mapping and preventing batch truncation bugs.
"""
import time
from typing import List
from langchain_google_genai import GoogleGenerativeAIEmbeddings

class RobustGeminiEmbeddings(GoogleGenerativeAIEmbeddings):
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Robustly embed documents individually to prevent batch truncation bugs."""
        results = []
        for i, text in enumerate(texts):
            if i > 0 and i % 25 == 0:
                time.sleep(10)  # Built-in rate limiting for free tier
            results.append(self.embed_query(text))
        return results

def get_robust_embeddings() -> RobustGeminiEmbeddings:
    return RobustGeminiEmbeddings(model="models/gemini-embedding-2")
