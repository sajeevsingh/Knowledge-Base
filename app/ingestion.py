import uuid
from pathlib import Path
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from app.config import get_qdrant_client

# === Setup base paths ===
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# === Initialize embedding model and chunker ===
embedder = SentenceTransformer("BAAI/bge-base-en-v1.5")  # 768-dimensional
client = get_qdrant_client()
splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)


def ingest_docs(mode: str):
    """
    Ingest all .txt documents from a specific mode ('customer' or 'internal')
    into the corresponding Qdrant collection.
    """
    folder = DATA_DIR / f"{mode}_docs"
    collection_name = f"{mode}_docs"

    # Ensure the folder exists
    folder.mkdir(parents=True, exist_ok=True)

    # Drop and recreate collection to match correct vector size
    if client.collection_exists(collection_name):
        print(f"⚠️ Collection `{collection_name}` already exists — deleting...")
        client.delete_collection(collection_name)

    print(f"➕ Creating collection `{collection_name}`...")
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    )

    all_chunks = []

    # Read and split all .txt files
    for path in folder.glob("*.txt"):
        with path.open("r", encoding="utf-8") as f:
            text = f.read()
            chunks = splitter.split_text(text)
            all_chunks.extend([(chunk, path.name) for chunk in chunks])

    if not all_chunks:
        print(f"⚠️ No documents found in {folder}. Skipping ingestion.")
        return

    print(f"🔍 Ingesting {len(all_chunks)} chunks into `{collection_name}`")

    # Embed and insert into Qdrant
    for chunk, source in all_chunks:
        vector = embedder.encode(chunk).tolist()
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"text": chunk, "source": source}
        )
        client.upsert(collection_name=collection_name, points=[point])

    print(f"✅ Ingestion complete for `{collection_name}`.")


# === Run from terminal ===
if __name__ == "__main__":
    ingest_docs("customer")
    ingest_docs("internal")