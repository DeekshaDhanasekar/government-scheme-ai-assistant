from app.rag.retriever import retrieve_documents
from app.rag.llm import generate_answer


question = "What is PM Kisan scheme?"


docs = retrieve_documents(
    question,
    k=2
)


context = "\n\n".join(
    [
        doc.page_content
        for doc in docs
    ]
)


answer = generate_answer(
    question,
    context
)


print("\nAnswer:")
print(answer)