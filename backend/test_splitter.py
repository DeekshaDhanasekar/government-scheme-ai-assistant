from app.rag.document_loader import load_documents
from app.rag.text_splitter import split_documents


documents = load_documents()

chunks = split_documents(documents)

print("\nNumber of chunks:", len(chunks))

print("\nFirst chunk:")
print(chunks[0].page_content[:500])