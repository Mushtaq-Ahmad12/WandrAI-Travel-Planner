"""
ingest_guides.py — CLI to ingest local PDF travel guides into FAISS.

Usage:
    python scripts/ingest_guides.py --pdf data/guides/paris.pdf --city Paris
"""
import sys, os, argparse
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()
from services.ingestor_service import ingest_text
from services.destination_service import normalize_destination
from langchain_community.document_loaders import PyPDFLoader

def main():
    parser = argparse.ArgumentParser(description="Ingest a PDF travel guide into FAISS")
    parser.add_argument("--pdf", required=True, help="Path to PDF file")
    parser.add_argument("--city", required=True, help="City the guide covers")
    args = parser.parse_args()

    if not os.path.exists(args.pdf):
        print(f"Error: File not found: {args.pdf}")
        sys.exit(1)

    norm_city = normalize_destination(args.city)
    print("Connecting to FAISS vector database...")
    print(f"Loading PDF: {args.pdf} for destination '{norm_city}'")

    try:
        loader = PyPDFLoader(args.pdf)
        pages = loader.load()
        full_text = "\n\n".join(p.page_content for p in pages)
        print(f"Loaded {len(pages)} pages, {len(full_text):,} characters")

        print(f"Chunking and embedding for destination: {norm_city}")
        source = os.path.basename(args.pdf)
        count = ingest_text(full_text, norm_city, source)
        print(f"Done! Successfully stored {count} chunks for '{norm_city}'")
    except Exception as e:
        print(f"Ingestion failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
