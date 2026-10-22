from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("dataset/raw/SMAM2024.pdf")   # adjust if needed

docs = loader.load()

print("Pages:", len(docs))

for i, doc in enumerate(docs[:5]):
    print("\nPAGE", i + 1)
    print("Metadata:", doc.metadata)
    print(doc.page_content[:1000])