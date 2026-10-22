import faiss
import pickle
import os
import numpy as np

from app.config import EMBEDDINGS_PATH


def create_vector_store(embeddings, chunks):

    # Normalize embeddings for cosine similarity
    embeddings = np.array(
        embeddings
    ).astype("float32")


    faiss.normalize_L2(
        embeddings
    )


    dimension = embeddings.shape[1]


    # Inner Product = cosine similarity after normalization
    index = faiss.IndexFlatIP(
        dimension
    )


    index.add(
        embeddings
    )


    os.makedirs(
        EMBEDDINGS_PATH,
        exist_ok=True
    )


    faiss.write_index(
        index,
        os.path.join(
            EMBEDDINGS_PATH,
            "faiss.index"
        )
    )


    with open(
        os.path.join(
            EMBEDDINGS_PATH,
            "chunks.pkl"
        ),
        "wb"
    ) as f:

        pickle.dump(
            chunks,
            f
        )


    print("Vector store created successfully")

    return index



def load_vector_store():

    index = faiss.read_index(
        os.path.join(
            EMBEDDINGS_PATH,
            "faiss.index"
        )
    )


    with open(
        os.path.join(
            EMBEDDINGS_PATH,
            "chunks.pkl"
        ),
        "rb"
    ) as f:

        chunks = pickle.load(
            f
        )


    return index, chunks