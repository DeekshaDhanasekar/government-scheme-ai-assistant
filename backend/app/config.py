import os
from dotenv import load_dotenv

load_dotenv()


# Project paths
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "dataset"
)

RAW_DATA_PATH = os.path.join(
    DATASET_PATH,
    "raw"
)

PROCESSED_DATA_PATH = os.path.join(
    DATASET_PATH,
    "processed"
)

EMBEDDINGS_PATH = os.path.join(
    DATASET_PATH,
    "embeddings"
)


# AI Configuration
GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


# RAG Settings
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 500


# Embedding Model
EMBEDDING_MODEL = (
    "sentence-transformers/"
    "paraphrase-multilingual-MiniLM-L12-v2"
)