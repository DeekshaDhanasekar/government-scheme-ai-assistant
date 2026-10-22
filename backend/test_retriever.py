from app.rag.retriever import retrieve_documents

queries = [
    "What is SMAM?",
    "Sub Mission on Agricultural Mechanization",
    "Revision in the Operational Guidelines of Sub Mission on Agricultural Mechanization",
]

for query in queries:
    print("\n" + "=" * 80)
    print("Query:", query)
    print("=" * 80)

    results = retrieve_documents(query)

    print("\nRetrieved Results:")

    if not results:
        print("No results found.")
        continue

    for i, doc in enumerate(results):
        print(f"\n--- Result {i+1} ---")
        print(doc[:500])