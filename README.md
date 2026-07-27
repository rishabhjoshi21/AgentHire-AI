# AgentHire-Ai

> **AgentHire** is an AI-powered Resume Intelligence Platform that helps job seekers optimize resumes, improve ATS compatibility, prepare for interviews, and build personalized learning roadmaps using Agentic AI, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs).

---

# Vision

Finding a job has become increasingly difficult due to Applicant Tracking Systems (ATS), keyword filtering, and highly competitive hiring processes. Many qualified candidates never reach an interview because they lack visibility into how their resumes are evaluated.

AgentHire aims to bridge this gap by combining AI, semantic search, and intelligent agents to provide actionable insights that improve a candidate's chances of getting hired.

Rather than acting as a simple chatbot, AgentHire is designed as a modular AI platform capable of orchestrating multiple specialized agents that collaborate to solve complex career-related tasks.

---

# Goals

The primary objectives of AgentHire are:

- Analyze resumes against job descriptions
- Calculate ATS compatibility scores
- Identify missing skills and keywords
- Recommend resume improvements
- Generate role-specific interview questions
- Create personalized learning roadmaps
- Support multiple LLM providers through a provider-agnostic architecture
- Demonstrate production-grade backend architecture using modern engineering practices

---

# Functional Requirements

### User Management

- User registration
- User authentication
- JWT authorization
- Profile management

### Resume Management

- Upload multiple resumes
- Resume versioning
- Resume history

### Job Description Management

- Save and organize job descriptions
- Associate resumes with job descriptions

### Resume Intelligence

- Resume parsing
- ATS score generation
- Keyword extraction
- Skill gap analysis
- Resume improvement recommendations

### AI Features

- Resume Analysis Agent
- Interview Question Generator
- Learning Roadmap Generator
- ATS Optimization Agent
- Multi-provider LLM support
- Retrieval-Augmented Generation (RAG)

---

# Non-Functional Requirements

### Scalability

- Modular architecture
- Independent AI providers
- Easily extensible agent framework

### Maintainability

- SOLID Principles
- Clean Architecture
- Dependency Injection
- Provider abstraction

### Reliability

- Structured exception handling
- LLM retry mechanism
- Graceful provider switching
- Consistent response formatting

### Performance

- Redis caching
- Efficient prompt execution
- Background task processing
- Optimized database access

### Security

- JWT Authentication
- Password hashing
- Input validation
- Environment-based configuration
- Secure API key management

---

# Technology Stack

## Backend

- NestJS
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## AI

- Google Gemini
- OpenAI
- Agentic AI
- Retrieval-Augmented Generation (Planned)
- Embeddings (Planned)

## Infrastructure

- Redis
- Docker (Planned)
- GitHub Actions (Planned)

## Authentication

- JWT
- Passport

---

# System Architecture

```text
                                   +----------------------+
                                   |   Web / Mobile App   |
                                   +----------+-----------+
                                              |
                                        REST API
                                              |
                                              ▼
+--------------------------------------------------------------------------------------+
|                                  NestJS Backend                                      |
|--------------------------------------------------------------------------------------|
|                                                                                      |
|  Authentication Module                                                                |
|  User Module                                                                          |
|  Resume Module                                                                        |
|  Job Description Module                                                               |
|  Analysis Module                                                                      |
|                                                                                      |
+----------------------------------------+---------------------------------------------+
                                         |
                                         ▼
                                Agent Orchestrator
                                         |
              +--------------------------+--------------------------+
              |                          |                          |
              ▼                          ▼                          ▼
     Resume Analysis Agent      Interview Agent         Learning Agent
              |                          |                          |
              +--------------------------+--------------------------+
                                         |
                                  Tool Registry Layer
                                         |
       +----------------------+----------------------+----------------------+
       |                      |                      |                      |
       ▼                      ▼                      ▼                      ▼
 Resume Parser         ATS Scoring Tool     Keyword Extractor         RAG Service
                                                                        |
                                           +----------------------------+-------------------------+
                                           |                                                      |
                                           ▼                                                      ▼
                                   Embedding Service                                     Vector Database
                                           |                                                      |
                                           +----------------------------+-------------------------+
                                                                        |
                                                                        ▼
                                                                Context Builder
                                                                        |
                                                                        ▼
                                                                   LLM Service
                                                                        |
                                                             LLM Provider Interface
                                                                        |
                             +----------------------------+--------------+----------------------+
                             |                            |                                     |
                             ▼                            ▼                                     ▼
                    Gemini Provider             OpenAI Provider                    Claude Provider
                                                                                     (Future)
                                                            |
                                                            ▼
                                                Structured AI Response
                                                            |
                                                            ▼
                                                     Analysis Module
                                                            |
                                                            ▼
                                                       REST Response
```

---

# AI Processing Flow

```text
User Request
      │
      ▼
Analysis Module
      │
      ▼
Agent Orchestrator
      │
      ▼
Selected AI Agent
      │
      ▼
Tool Registry
      │
      ├────────► Resume Parser
      ├────────► ATS Scoring
      ├────────► Keyword Extraction
      └────────► RAG Retrieval
                       │
                       ▼
               Context Builder
                       │
                       ▼
                 LLM Service
                       │
                       ▼
             Structured AI Output
                       │
                       ▼
                 REST Response
```

---

# LLM Provider Architecture

```text
                Analysis Module
                       │
                       ▼
                  LLM Service
                       │
                       ▼
               LLMProvider Interface
                       │
          +------------+------------+
          |                         |
          ▼                         ▼
  Gemini Provider          OpenAI Provider
          │                         │
          └------------+------------┘
                       │
                Runtime Selection
                 (.env Configuration)
```

---

# Development Progress

### Completed

- Project foundation
- Authentication module
- Resume management
- Job description management
- Provider-agnostic LLM architecture
- Gemini integration
- OpenAI integration

### Currently In Progress

- Resume Analysis Engine
- Prompt engineering
- Structured AI response generation

### Planned

#### AI Layer

- Retrieval-Augmented Generation (RAG)
- Embedding generation
- Vector database integration
- Multi-agent orchestration
- Tool execution framework

#### Infrastructure

- Docker
- CI/CD
- Monitoring
- Logging
- Background queues

#### Future Integrations

- MCP Server
- External Tool Calling
- Gmail
- GitHub
- Calendar
- Notion

---

# Running the Project

```bash
git clone <repository-url>

cd agenthire

npm install

npx prisma migrate dev

npm run start:dev
```

---

# Future Scope

AgentHire is being designed as an extensible AI platform. Future releases will focus on:

- Multi-agent collaboration
- Autonomous workflow execution
- External tool integrations through MCP
- Company-specific knowledge bases
- Conversation memory
- AI-assisted career coaching
- Enterprise hiring workflows

---

# License

This project is developed for educational purposes, experimentation, and as a portfolio project to demonstrate modern backend engineering and AI application development.
