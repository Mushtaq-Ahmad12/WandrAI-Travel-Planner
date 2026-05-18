"""
fetch_wikivoyage.py — Fetches REAL travel guide content from Wikivoyage
with automated fallback to Wikipedia and robust retry systems.
Ingests extracted guide chunks into local FAISS vector store.

Usage:
    python scripts/fetch_wikivoyage.py --city Paris
    python scripts/fetch_wikivoyage.py --city Tokyo
    python scripts/fetch_wikivoyage.py --city "New York City"
    python scripts/fetch_wikivoyage.py --all
"""
import sys
import os
import re
import argparse
import requests
import time
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from services.ingestor_service import ingest_text
from services.destination_service import normalize_destination

WIKIVOYAGE_API = "https://en.wikivoyage.org/w/api.php"
WIKIPEDIA_API = "https://en.wikipedia.com/w/api.php"
WIKIPEDIA_API_ORG = "https://en.wikipedia.org/w/api.php"

DEFAULT_CITIES = {
    "paris": "Paris",
    "tokyo": "Tokyo",
    "new york city": "New York City",
    "barcelona": "Barcelona",
    "rome": "Rome",
    "london": "London",
    "dubai": "Dubai",
    "bangkok": "Bangkok",
    "amsterdam": "Amsterdam",
    "istanbul": "Istanbul",
}

def fetch_wiki_api(api_url: str, title: str) -> str:
    """Make robust query to MediaWiki API with retries and redirect resolution."""
    headers = {
        "User-Agent": "WandrAI/1.0 (https://github.com/wandrai; user@example.com)"
    }
    params = {
        "action": "query",
        "titles": title,
        "prop": "extracts",
        "explaintext": True,
        "exsectionformat": "plain",
        "format": "json",
        "redirects": 1,
    }
    for attempt in range(3):
        try:
            resp = requests.get(api_url, params=params, headers=headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            pages = data.get("query", {}).get("pages", {})
            for page_id, page in pages.items():
                if page_id != "-1":
                    return page.get("extract", "")
        except Exception:
            time.sleep(2)
    return ""

def clean_wiki_text(text: str) -> str:
    """Remove wiki markup artifacts from plain text extraction."""
    text = re.sub(r'\s*==+\s*edit\s*==+\s*', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'\(\d+°\d+′[NS]\s+\d+°\d+′[EW]\)', '', text)
    lines = [l for l in text.splitlines() if len(l.strip()) > 3]
    return "\n".join(lines).strip()

def fetch_and_ingest(raw_city: str, verbose: bool = True) -> int:
    """Fetch Wikivoyage (or Wikipedia fallback) article and ingest into FAISS."""
    city = normalize_destination(raw_city)
    article_title = DEFAULT_CITIES.get(city.lower(), city)

    if verbose:
        print(f"\nFetching travel guide for: '{article_title}' ...")

    # Priority 1: Wikivoyage
    raw_text = fetch_wiki_api(WIKIVOYAGE_API, article_title)
    source_type = "Wikivoyage"
    
    # Priority 2: Wikipedia Fallback
    if not raw_text or len(raw_text) < 500:
        if verbose:
            print(f"  Wikivoyage content insufficient/missing. Attempting Wikipedia fallback...")
        raw_text = fetch_wiki_api(WIKIPEDIA_API_ORG, article_title)
        source_type = "Wikipedia"

    if not raw_text or len(raw_text) < 500:
        if verbose:
            print(f"  Empty content for {article_title} across both Wikivoyage and Wikipedia.")
        return 0

    clean_text = clean_wiki_text(raw_text)

    if verbose:
        print(f"  Fetched {len(clean_text):,} characters from {source_type}")
        print(f"  Chunking and embedding...")

    source_doc = f"{source_type} — {article_title}"
    count = ingest_text(clean_text, city.lower().strip(), source_doc)

    if verbose:
        print(f"  Ingested {count} chunks for '{city}' into FAISS")

    return count

def main():
    parser = argparse.ArgumentParser(description="Fetch and ingest Wikivoyage/Wikipedia travel guides")
    parser.add_argument("--city", type=str, help="City name to fetch (e.g. Paris)")
    parser.add_argument(
        "--all",
        action="store_true",
        help=f"Fetch all default cities: {', '.join(DEFAULT_CITIES.keys())}",
    )
    args = parser.parse_args()

    if not args.city and not args.all:
        parser.print_help()
        sys.exit(1)

    print("Connecting to FAISS DB...")
    total_chunks = 0

    if args.all:
        print(f"\nFetching {len(DEFAULT_CITIES)} cities...")
        for city_key in DEFAULT_CITIES:
            try:
                count = fetch_and_ingest(city_key)
                total_chunks += count
            except Exception as e:
                print(f"  Failed for {city_key}: {e}")
    else:
        try:
            total_chunks = fetch_and_ingest(args.city)
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)

    print(f"\nDone! Total chunks stored: {total_chunks}")

if __name__ == "__main__":
    main()
