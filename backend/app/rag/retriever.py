import numpy as np

from app.rag.vector_store import load_vector_store
from app.rag.embedding_model import get_embedding_model


def retrieve_documents(query, k=10):

    index, chunks = load_vector_store()

    model = get_embedding_model()


    query_embedding = model.encode(
    [query],
    normalize_embeddings=True
)


    query_embedding = model.encode(
    [query],
    normalize_embeddings=True
)


    query_embedding = np.array(
        query_embedding
    ).astype("float32")


    distances, indices = index.search(
        query_embedding,
        k
    )


    results = []


    print("\n========== RETRIEVED DOCUMENTS ==========")
    print("Query:", query)


    for distance, idx in zip(distances[0], indices[0]):

        if idx == -1:
            continue


        document = chunks[idx]


        print("\nSimilarity Score:", distance)


        # Convert Document object into text
        if hasattr(document, "page_content"):

            text = document.page_content

        else:

            text = document


        print(text[:300])


        # Store only text
        results.append(text)



    print("\n=========================================\n")


    return results