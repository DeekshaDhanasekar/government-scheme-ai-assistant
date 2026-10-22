from sentence_transformers import SentenceTransformer
import numpy as np


MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


model = None


def get_embedding_model():

    global model

    if model is None:

        model = SentenceTransformer(
            MODEL_NAME
        )

        print("Embedding model loaded successfully")

    return model



def generate_embeddings(chunks):

    model = get_embedding_model()


    # Convert Document objects into plain text
    texts = [
        chunk.page_content if hasattr(chunk, "page_content") else chunk
        for chunk in chunks
    ]


    embeddings = model.encode(
        texts,
        normalize_embeddings=True
    )


    embeddings = np.array(
        embeddings
    ).astype("float32")


    print(
        f"Generated embeddings: {len(embeddings)}"
    )


    return embeddings