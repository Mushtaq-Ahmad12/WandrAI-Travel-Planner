"""
AI Travel Planner - FastAPI Backend Entry Point
Includes structured logging, CORS configuration, and standardized JSON error handling.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Configure professional structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("wandrai.api")

from api.routes import itinerary, weather, guides, destinations

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting WandrAI Travel Planner API service...")
    yield
    logger.info("Shutting down API service...")

app = FastAPI(
    title="WandrAI Travel Planner API",
    description="Production-grade RAG-powered travel itinerary generator with real-time weather integration",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized JSON Error Handlers (Requirement 13)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP {exc.status_code} error on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "API Error", "details": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "details": str(exc)},
    )

app.include_router(itinerary.router, prefix="/api", tags=["Itinerary"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])
app.include_router(guides.router, prefix="/api", tags=["Guides"])
app.include_router(destinations.router, prefix="/api", tags=["Destinations"])

@app.get("/", tags=["Health"])
async def root():
    return {"message": "WandrAI Travel Planner API", "status": "online", "version": "1.0.0", "docs": "/docs"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "wandrai-backend"}
