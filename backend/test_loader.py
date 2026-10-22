from app.rag.document_loader import load_documents

docs = load_documents()

print(f"Total documents: {len(docs)}")

print("\nSearching for SMAM...\n")

found = False

for i, doc in enumerate(docs):
    text = doc.page_content

    if "SMAM" in text or "Sub Mission on Agricultural Mechanization" in text:
        found = True
        print(f"\nFound in document {i+1}")
        print("-" * 60)
        print(text[:1000])
        print("-" * 60)

if not found:
    print("SMAM text not found in loaded documents.")