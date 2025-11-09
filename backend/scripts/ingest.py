import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from openai import OpenAI
from supabase import create_client, Client
from typing import List, Dict
import time

# Load environment variables
load_dotenv()

# Initialize clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def extract_text_from_pdf(pdf_path: str) -> List[Dict]:
    reader = PdfReader(pdf_path)
    pages = []
    
    for page_num, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if text.strip():  # Only include pages with text
            pages.append({
                "page_number": page_num,
                "text": text.strip()
            })
    
    print(f"Extracted {len(pages)} pages from {pdf_path}")
    return pages

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
    
    return chunks

def generate_embedding(text: str) -> List[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

def process_pdf(pdf_path: str, source_name: str = None):
    if source_name is None:
        source_name = os.path.basename(pdf_path)
    
    print(f"\n{'='*60}")
    print(f"Processing: {source_name}")
    print(f"{'='*60}")
    
    # Extract text from PDF
    pages = extract_text_from_pdf(pdf_path)
    
    # Process each page
    total_chunks = 0
    for page_data in pages:
        page_num = page_data["page_number"]
        text = page_data["text"]
        
        # Chunk the page text
        chunks = chunk_text(text, chunk_size=500, overlap=50)
        print(f"Page {page_num}: Created {len(chunks)} chunks")
        
        # Generate embeddings and upload each chunk
        for chunk_idx, chunk in enumerate(chunks):
            try:
                # Generate embedding
                embedding = generate_embedding(chunk)
                
                # Prepare metadata
                metadata = {
                    "source": source_name,
                    "page": page_num,
                    "chunk_index": chunk_idx
                }
                
                # Insert into Supabase
                supabase.table("documents").insert({
                    "content": chunk,
                    "embedding": embedding,
                    "metadata": metadata
                }).execute()
                
                total_chunks += 1
                
                # Rate limiting - OpenAI has limits on embeddings per minute
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error processing chunk {chunk_idx} on page {page_num}: {e}")
                continue
    
    print(f"\n✓ Successfully uploaded {total_chunks} chunks from {source_name}")
    return total_chunks

def ingest_manuals(pdf_directory: str):
    pdf_files = [f for f in os.listdir(pdf_directory) if f.endswith('.pdf')]
    
    if not pdf_files:
        print(f"No PDF files found in {pdf_directory}")
        return
    
    print(f"\nFound {len(pdf_files)} PDF files to process")
    total_chunks = 0
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_directory, pdf_file)
        chunks = process_pdf(pdf_path, source_name=pdf_file)
        total_chunks += chunks
    
    print(f"\n{'='*60}")
    print(f"INGESTION COMPLETE")
    print(f"Total PDFs processed: {len(pdf_files)}")
    print(f"Total chunks uploaded: {total_chunks}")
    print(f"{'='*60}")

if __name__ == "__main__":
    process_pdf("manuals/Nvidia_H100_Install_Guide.pdf", "Nvidia_H100_Install_Guide.pdf")