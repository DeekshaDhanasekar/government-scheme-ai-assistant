from app.rag.document_loader import load_documents
from app.rag.text_splitter import split_documents
from app.rag.embedding_model import generate_embeddings
from app.rag.vector_store import create_vector_store


documents = load_documents()

chunks = split_documents(documents)

embeddings = generate_embeddings(chunks)


create_vector_store(
    embeddings,
    chunks
)