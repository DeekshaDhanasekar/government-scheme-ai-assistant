from app.rag.document_loader import load_documents
from app.rag.text_splitter import split_documents
from app.rag.embedding_model import generate_embeddings


documents = load_documents()

chunks = split_documents(documents)

embeddings = generate_embeddings(chunks)


print("\nEmbedding shape:")
print(embeddings.shape)