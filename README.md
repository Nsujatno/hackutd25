# Kanban Sync: AI-Powered Workflow & Validation for Datacenters

**HackUTD Hackathon Submission | November 2025**

## Project Overview
**Kanban Sync** is a sophisticated, AI-powered workflow assistant engineered to dramatically improve the efficiency and safety of **datacenter operations**. In complex environments where minor errors can lead to major outages, the project's core mission is twofold:
1. **Natural Language Task Creation**: Allow engineers to create, describe, and manage complex maintenance tasks using natural language, translating high-level intent into actionable steps.

2. **Pre-Execution Validation**: Implement a safety-critical AI pipeline to validate all natural language instructions against official datacenter operational manuals, preventing non-compliant or potentially dangerous actions before they are executed.

Kanban Sync transforms manual, error-prone checklist execution into a streamlined, context-aware, and safety-validated workflow.

## Workflow (dual RAG pipeline)
The central innovation of Kanban Sync is its **Dual-RAG (Retrieval-Augmented Generation) pipeline**, designed for rigorous instruction validation:

1. **The Validation Challenge**

Datacenter environments are governed by extensive, constantly updated documentation. The challenge is ensuring that a newly created task—described in conversational language by an operator—does not conflict with established procedures, security protocols, or hardware limitations buried deep within manuals.

2. **The Dual-RAG Solution**

We implemented a two-stage RAG system leveraging OpenAI models for precision and efficiency:

Embedding/Retrieval: We utilized OpenAI Ada embeddings to convert the comprehensive set of datacenter manuals into high-density vector embeddings stored in a Supabase vector database. This allows for rapid and contextually accurate similarity searching.

Validation & Generation: When a task is submitted, the system retrieves the most semantically relevant sections of the manuals. This context is then fed, along with the user's task instruction, to GPT-4o-mini. The model's task is to analyze the retrieved manual sections and explicitly confirm or deny the validity of the proposed instruction.

This dual-system approach ensures validation is fast, highly accurate, and directly grounded in the source documentation, effectively serving as an intelligent safety gate.

## Tech stack
### FastAPI
- High-performance API framework handling all input/output. It serves as the gateway for processing natural language tasks and orchestrating the RAG pipeline calls.

### Supabase
- Used for complete backend infrastructure, relational data storage (Kanban board, user profiles), and hosting the vector database necessary for the RAG pipeline's similarity search.

### GPT 4o mini
- The core LLM responsible for analyzing user instructions, querying the retrieved documents, and providing the final, validated decision (compliant/non-compliant) for the task.

### OpenAI ada embeddings
- The standard embedding model used to index the datacenter manuals into vector format, powering the highly efficient contextual retrieval.
