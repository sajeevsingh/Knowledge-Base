from sentence_transformers import SentenceTransformer
from app.config import get_qdrant_client

def retrieve_relevant_chunks(question: str, mode: str = "customer", top_k: int = 5):
    """
    Retrieve top-k relevant document chunks from Qdrant based on a user's question.

    Args:
        question: The user's query string
        mode: 'customer' or 'internal' to select the appropriate collection
        top_k: Number of chunks to retrieve

    Returns:
        A list of document payloads containing 'text' and optionally 'source'
    """
    embedder = SentenceTransformer("BAAI/bge-base-en-v1.5")
    client = get_qdrant_client()

    # Embed the query
    query_vector = embedder.encode(question).tolist()

    # Select the collection based on mode
    collection_name = f"{mode}_docs"

    # Search the vector store
    hits = client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=top_k
    )

    return [hit.payload for hit in hits]