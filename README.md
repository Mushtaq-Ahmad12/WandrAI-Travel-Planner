# 🌍 WandrAI — AI Travel Itinerary Planner

A full-stack, enterprise-grade AI travel planner that generates **weather-aware, RAG-grounded** day-by-day itineraries using authoritative Wikivoyage travel guides and live meteorological forecasts.

---

## ✨ Features

- 🗺️ **RAG-Grounded Reality** — Activities and schedules are constructed exclusively from real Wikivoyage travel guide knowledge stored in local FAISS vector databases (eliminating AI hallucinations).
- 🌦️ **Meteorological Adaptability** — Integrates live Open-Meteo geocoded forecasts, automatically switching outdoor walking tours to indoor cultural alternatives (museums, cafes, galleries) on rainy days.
- 📚 **Authoritative Source Citations** — Every single activity slot attributes its source document precisely.
- ⚡ **Powered by Gemini 2.5 Flash** — Lightning-fast structured JSON itinerary orchestration.
- 🌐 **Universal Destination Support** — Built-in alias resolution for worldwide countries, regions, and cities.
- 🌙 **Rich Aesthetics** — Stunning glassmorphism UI, smooth Framer Motion micro-animations, and full dark mode.

---

## 🏗️ Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18 + TypeScript + Vite              |
| Styling     | Tailwind CSS + Framer Motion              |
| Backend     | FastAPI (Python 3.11+)                    |
| RAG Engine  | LangChain + FAISS CPU                     |
| Embeddings  | Google GenAI `models/gemini-embedding-2`  |
| LLM         | Google Gemini `gemini-2.5-flash`          |
| Weather     | Open-Meteo API (free, no API key needed)  |
| Guide Data  | Wikivoyage / Wikipedia MediaWiki APIs     |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Google GenAI (Gemini) API key

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### 2. Ingest Real Travel Guide Data

```bash
# Fetch real Wikivoyage data for all default cities (Paris, Tokyo, NYC, London, Dubai, etc.)
python scripts/fetch_wikivoyage.py --all

# Or fetch any single city worldwide
python scripts/fetch_wikivoyage.py --city Tokyo
python scripts/fetch_wikivoyage.py --city Paris
python scripts/fetch_wikivoyage.py --city Swat

# Or ingest your own local PDF guide
python scripts/ingest_guides.py --pdf path/to/guide.pdf --city "City Name"
```

### 3. Start the Backend Server

```bash
uvicorn main:app --reload --port 8000
```

API documentation available at: http://localhost:8000/docs

---

### 4. Start the Frontend Server

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
GOOGLE_API_KEY=AIzaSy...your-gemini-key-here
FAISS_PERSIST_DIR=./vector_db/faiss_store
```

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                                |
|--------|---------------------------|--------------------------------------------|
| POST   | `/api/generate-itinerary` | Generate complete RAG itinerary            |
| GET    | `/api/weather`            | Fetch weather forecast for city + dates    |
| POST   | `/api/upload-guides`      | Upload PDF travel guide                    |
| POST   | `/api/upload-text`        | Ingest raw text travel guide               |
| GET    | `/api/destinations`       | List cities with indexed guide data        |

### Example Request

```bash
curl -X POST http://localhost:8000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo",
    "start_date": "2026-05-20",
    "end_date": "2026-05-22",
    "travel_style": "Cultural",
    "budget": "Medium",
    "interests": ["Temples", "Architecture", "Sushi"]
  }'
```

---

## 🗂️ Project Structure

```
Travel — AI Itinerary Builder/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── .env
│   ├── api/routes/              # itinerary, weather, guides, destinations
│   ├── services/                # rag, llm, weather, ingestor, destination, embedding
│   ├── models/                  # Pydantic models (Itinerary, Weather)
│   ├── vector_db/               # FAISS local vector store
│   └── scripts/                 # fetch_wikivoyage.py, ingest_guides.py
└── frontend/
    ├── src/
    │   ├── pages/               # HomePage, ItineraryPage
    │   ├── components/          # form, itinerary, weather, ui, layout
    │   ├── hooks/               # useItinerary, useTheme
    │   ├── services/            # api.ts (Axios)
    │   └── types/               # itinerary.ts (TypeScript interfaces)
    └── ...
```

---

## 📝 License

MIT — Free to use, modify, and deploy.

---

*Built with ❤️ using Google Gemini 2.5 Flash, LangChain, FAISS CPU, FastAPI, React, and Wikivoyage.*
