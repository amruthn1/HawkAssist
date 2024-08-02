from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.prompts import ChatPromptTemplate
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from ChatOpenRouter import ChatOpenRouter
import fastapi
import pickle
import os
import requests

load_dotenv()

os.environ["TOKENIZERS_PARALLELISM"] = 'False'

app = Flask(__name__)

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def get_embedding_function():
    embeddings = HuggingFaceEmbeddings(model_name = "mixedbread-ai/mxbai-embed-large-v1")
    return embeddings

def load_documents():
    document_loader = PyPDFDirectoryLoader("./data")
    return document_loader.load()

def split_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=80,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)

if os.path.isfile("./documents.pickle"):
    with open('./documents.pickle', 'rb') as handle:
        documents = pickle.load(handle)
else:
    documents = split_documents(load_documents())
    with open('./documents.pickle', 'wb') as handle:
        pickle.dump(documents, handle, protocol=pickle.HIGHEST_PROTOCOL)

db = QdrantVectorStore.from_documents(
    documents,
    get_embedding_function(),
    url=os.getenv('QDRANT_URL'),
    prefer_grpc=True,
    collection_name="guidebot",
    api_key=os.getenv('QDRANT_API_KEY'),
)

print("Started server")

@app.route('/get', methods=['GET'])
def get_query():
    query = request.args.get('query')
    found_docs = db.similarity_search_with_score(query)
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in found_docs])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query)
    try:
        model = ChatOpenRouter(model_name="meta-llama/llama-3.1-8b-instruct:free")
    finally:
        model = ChatOpenRouter(model_name="meta-llama/llama-3.1-8b-instruct")
    response_text = model.invoke(prompt)
    return jsonify({"response": fastapi.encoders.jsonable_encoder(response_text), 'document': fastapi.encoders.jsonable_encoder(found_docs[0])})

if __name__ == '__main__':
    app.run(threaded=True)