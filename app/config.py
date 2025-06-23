from qdrant_client import QdrantClient
from pathlib import Path

# Point to project root
BASE_DIR = Path(__file__).resolve().parent.parent
QDRANT_PATH = BASE_DIR / "local_qdrant"

def get_qdrant_client():
    return QdrantClient(path=str(QDRANT_PATH))