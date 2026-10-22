import os
from langchain_community.document_loaders import PyPDFLoader

from app.config import RAW_DATA_PATH

def load_documents():
    documents = []

    if not os.path.exists(RAW_DATA_PATH):
        raise FileNotFoundError(
            f"Dataset folder not found: {RAW_DATA_PATH}"
        )

    for file in os.listdir(RAW_DATA_PATH):

        if file.endswith(".pdf"):

            file_path = os.path.join(
                RAW_DATA_PATH,
                file
            )

            loader = PyPDFLoader(file_path)

            docs = loader.load()

            documents.extend(docs)

            print(f"Loaded: {file}")

    print(f"Total pages loaded: {len(documents)}")

    return documents