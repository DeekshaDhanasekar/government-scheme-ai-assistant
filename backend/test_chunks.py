from app.rag.document_loader import load_documents
from app.rag.text_splitter import split_documents

docs = load_documents()
chunks = split_documents(docs)

print("\nFirst 20 chunk sources:\n")

for i, chunk in enumerate(chunks[:20]):
    print(chunk.metadata)