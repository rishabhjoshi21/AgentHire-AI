# AgentHire AI

> **AgentHire** is an AI-powered Career Intelligence Platform that helps job seekers understand their fit for a job, improve their resume, generate tailored application content, and prepare for interviews using Large Language Models (LLMs).

AgentHire is built as a modular backend platform using **NestJS, TypeScript, PostgreSQL, Prisma, Redis, and Google Gemini**, with an architecture designed to evolve toward RAG, MCP, and agentic AI capabilities.

---

## Vision

Modern hiring is increasingly driven by Applicant Tracking Systems (ATS), keyword matching, and highly competitive recruitment processes.

AgentHire addresses four core needs:

```text
Analyze → Improve → Apply → Prepare
```

- **Analyze** — compare a resume against a target job.
- **Improve** — identify and improve weak resume sections.
- **Apply** — generate a truthful, tailored cover letter.
- **Prepare** — generate role-specific interview questions.

The long-term goal is to evolve AgentHire into a Career Intelligence Platform with an AI Career Coach at its core.

---

## Core Features

### Authentication & User Management

- User registration and authentication
- JWT-based authorization
- Password hashing
- Protected API endpoints
- User-owned resource access

### Resume Management

- Resume metadata management
- Extracted raw resume content
- Optimized resume content
- File metadata and hashing
- Soft deletion
- Resume ownership

### Job Description Management

- Job title and company
- Raw job description content
- Job URL
- Content hashing
- User ownership
- Soft deletion

### Resume Analysis

Analyzes a resume against a job description and produces:

- ATS score
- Resume match score
- Matched skills
- Missing skills
- Missing keywords
- Strengths
- Recommendations
- Summary

The completed analysis becomes the shared context for downstream AI capabilities.

### Resume Review

Uses the resume, job description, and analysis to generate targeted improvements while preserving factual accuracy.

The AI is explicitly instructed not to invent skills, experience, projects, responsibilities, achievements, or qualifications.

### Interview Question Generator

Generates realistic interview questions from the resume, job description, and analysis.

Questions are grouped into:

- Technical
- System Design
- Behavioral
- Project Discussion

Example:

```json
{
  "overallSummary": "Questions focus on backend engineering, system design, cloud technologies, and project experience.",
  "categories": [
    {
      "category": "Technical",
      "questions": [
        "Explain the Node.js Event Loop.",
        "How would you optimize a slow REST API?"
      ]
    },
    {
      "category": "Behavioral",
      "questions": ["Tell me about a challenging production issue you solved."]
    }
  ]
}
```

Answers are intentionally not stored in V1.

### Cover Letter Generator

Generates a tailored professional cover letter using:

- Resume
- Job description
- Resume analysis

The prompt explicitly prevents hallucination of skills, experience, projects, achievements, responsibilities, certifications, or employment history.

---

## Why Learning Roadmap Is Not in V1

A separate Learning Roadmap module was considered but intentionally excluded from V1.

Resume Analysis already identifies skill gaps and missing requirements, while Interview Questions convert those gaps into concrete preparation areas.

A full roadmap would require additional product concepts such as skill-level assessment, learning resources, dependencies, schedules, and progress tracking. Those belong in a future platform phase.

---

## Architecture

```text
                                      User
                                        │
                                        ▼
                                Web / Mobile Client
                                        │
                                  HTTPS / REST API
                                        │
                                        ▼
                              NestJS REST Controllers
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
 Authentication                   Resume Module                Job Description
    Module                                                            Module
                                        │
                                        ▼
                              Resume Analysis Service
                                        │
                                        ▼
                                   PostgreSQL
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
        Resume Review          Interview Questions          Cover Letter
              │                         │                         │
              └─────────────────────────┼─────────────────────────┘
                                        ▼
                                  LLMService
                                        │
                                  LLMProvider
                                        │
                                        ▼
                              GeminiProvider
                                        │
                                        ▼
                                   Google Gemini
                                        │
                                        ▼
                              Structured JSON Response
                                        │
                                        ▼
                                  DTO Validation
                                        │
                                        ▼
                                   PostgreSQL
```

---

## Architecture Principles

### Modular Architecture

```text
src/modules/

├── analysis/
├── auth/
├── cover-letter/
├── interview-question/
├── job-description/
├── resume/
├── resume-review/
└── users/
```

Each business capability is isolated in its own NestJS module.

### Provider Abstraction

Business services do not directly depend on Gemini.

```text
Business Service
      │
      ▼
  LLMService
      │
      ▼
  LLMProvider
      │
      ▼
┌─────┼─────┐
▼     ▼     ▼
Gemini OpenAI Claude
Current Future Future
```

Current interface:

```ts
export interface LLMProvider {
  chat<T>(options: ChatOptions): Promise<T>;
  getModel(): string;
}
```

### Shared Analysis Context

```text
                    Analysis
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
Resume Review   Interview Questions   Cover Letter
```

### Repository Pattern

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Repositories support optional Prisma transactions:

```ts
private getPrisma(tx?: Prisma.TransactionClient) {
  return tx ?? this.prisma;
}
```

### DTO Validation

External request payloads and LLM responses are validated using DTOs, `class-transformer`, and `class-validator`.

---

## AI / LLM Architecture

```text
AnalysisService
ResumeReviewService
InterviewQuestionService
CoverLetterService
        │
        ▼
    LLMService
        │
        ▼
   LLMProvider
        │
        ▼
 GeminiProvider
        │
        ▼
 Google Gemini
```

The Gemini SDK is isolated inside the infrastructure/provider layer.

### Prompt Architecture

Each AI capability owns its prompts:

```text
analysis/
└── prompts/
    ├── analysis.system-prompt.ts
    └── analysis.prompt.ts

resume-review/
└── prompts/
    ├── resume-review.system-prompt.ts
    └── resume-review.prompt.ts

interview-question/
└── prompts/
    ├── interview-question.system-prompt.ts
    └── interview-question.prompt.ts

cover-letter/
└── prompts/
    ├── cover-letter.system-prompt.ts
    └── cover-letter.prompt.ts
```

### AI Response Validation

LLM output is treated as untrusted external data:

```text
Gemini
   │
   ▼
Raw Text
   │
   ▼
JSON Parser
   │
   ▼
DTO Transformation
   │
   ▼
class-validator
   │
   ▼
Validated Result
   │
   ▼
PostgreSQL
```

Malformed JSON or structurally invalid AI responses are rejected before persistence.

---

## Database Design

The central relationship is:

```text
User
 │
 └── Resume
       │
       └── Analysis
             │
             ├── ResumeReview
             │
             ├── InterviewQuestion
             │
             └── CoverLetter
```

AI-generated resources are associated with an `Analysis` rather than duplicating `userId`.

Authorization follows:

```text
User
 ↓
Resume
 ↓
Analysis
 ↓
Generated Resource
```

Each V1 AI generation resource has a unique `analysisId`, preventing duplicate generated results for the same analysis.

---

## Security

AgentHire currently uses:

- JWT authentication
- Passport authentication guards
- Password hashing
- DTO validation
- UUID validation
- User ownership checks
- Environment-based API key configuration
- Database relationships for authorization
- Structured exception handling

---

## API Overview

Current API groups:

```text
Authentication
Users
Resumes
Job Descriptions
Analyses
Resume Reviews
Interview Questions
Cover Letters
```

Representative endpoints:

```text
POST   /auth/...

POST   /resumes
GET    /resumes
GET    /resumes/:id

POST   /job-descriptions
GET    /job-descriptions
GET    /job-descriptions/:id

POST   /analyses
GET    /analyses
GET    /analyses/:id
POST   /analyses/:id/retry

POST   /resume-reviews
GET    /resume-reviews/:id
GET    /resume-reviews/analysis/:analysisId

POST   /interview-questions
GET    /interview-questions/:id
GET    /interview-questions/analysis/:analysisId

POST   /cover-letters
GET    /cover-letters/:id
GET    /cover-letters/analysis/:analysisId
```

Swagger/OpenAPI documents request DTOs, response DTOs, authentication requirements, and common error responses.

---

## Project Structure

```text
src/
│
├── infrastructure/
│   ├── database/
│   │   └── prisma/
│   └── llm/
│       ├── gemini/
│       ├── llm.dto.ts
│       ├── llm.service.ts
│       ├── llm-response-parser.ts
│       └── llm-error-handler.ts
│
├── modules/
│   ├── analysis/
│   ├── auth/
│   ├── cover-letter/
│   ├── interview-question/
│   ├── job-description/
│   ├── resume/
│   ├── resume-review/
│   └── users/
│
└── shared/
    ├── decorators/
    ├── exceptions/
    ├── filters/
    ├── guards/
    ├── interceptors/
    ├── logger/
    ├── middleware/
    └── utils/
```

---

## Technology Stack

| Layer                | Technology                    |
| -------------------- | ----------------------------- |
| Backend              | NestJS                        |
| Language             | TypeScript                    |
| Database             | PostgreSQL                    |
| ORM                  | Prisma                        |
| Current LLM          | Google Gemini                 |
| LLM Abstraction      | Custom LLM Provider Interface |
| Cache                | Redis                         |
| Queue                | BullMQ + Redis — planned      |
| Authentication       | JWT + Passport                |
| Validation           | class-validator               |
| Transformation       | class-transformer             |
| API Documentation    | Swagger / OpenAPI             |
| Containerization     | Docker                        |
| CI/CD                | GitHub Actions                |
| Future LLM Providers | OpenAI, Claude                |
| Future Vector Store  | Vector Database               |

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL
- Redis
- Google Gemini API key

### Installation

```bash
git clone <repository-url>
cd agenthire
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required environment variables.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run start:dev
```

---

## Environment Variables

Typical configuration:

```env
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=...
```

Use `.env.example` as the source of truth for the complete configuration.

Never commit secrets to source control.

---

## Development Commands

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Lint
npm run lint

# Unit tests
npm run test

# Watch tests
npm run test:watch

# E2E tests
npm run test:e2e

# Prisma migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

---

## Current Project Status

### Completed

#### Core Platform

- Authentication
- User management
- Resume management
- Job description management
- PostgreSQL database
- Prisma ORM
- Swagger documentation
- DTO validation
- JWT authorization

#### AI Platform

- LLM provider abstraction
- Gemini provider
- Generic LLM response parser
- AI response validation
- Centralized LLM error handling
- Modular prompt architecture

#### AI Features

- Resume Analysis
- ATS Compatibility Analysis
- Resume Match Analysis
- Resume Review
- Interview Question Generation
- Cover Letter Generation

#### Engineering

- Repository pattern
- Service layer
- Modular NestJS architecture
- Transaction-ready repositories
- User ownership validation
- Structured exception handling
- Database-level uniqueness constraints
- Prisma relations

---

## Functional Requirements

| ID    | Requirement                        | Status       |
| ----- | ---------------------------------- | ------------ |
| FR-01 | User Registration & Authentication | ✅ Completed |
| FR-02 | Resume Management                  | ✅ Completed |
| FR-03 | Job Description Management         | ✅ Completed |
| FR-04 | Resume Analysis                    | ✅ Completed |
| FR-05 | ATS Compatibility Analysis         | ✅ Completed |
| FR-06 | Resume Review & Improvement        | ✅ Completed |
| FR-07 | Interview Question Generation      | ✅ Completed |
| FR-08 | Cover Letter Generation            | ✅ Completed |
| FR-09 | RAG-Based Career Assistant         | 📅 Planned   |
| FR-10 | AI Conversation                    | 📅 Planned   |
| FR-11 | MCP Server                         | 📅 Planned   |
| FR-12 | Career Coach Agent                 | 📅 Planned   |

---

## Non-Functional Requirements

### Scalability

- Modular feature-based architecture
- Stateless REST APIs
- Provider abstraction
- Database-backed persistence
- Planned asynchronous AI processing
- Planned background job queues

### Maintainability

- SOLID principles
- Dependency Injection
- Repository pattern
- DTO-based validation
- Independent AI modules
- Provider abstraction
- Centralized infrastructure services

### Reliability

Current:

- Structured exception handling
- AI response validation
- Database constraints
- User ownership checks

Planned:

- Retry strategies
- Background job processing
- Idempotent AI processing
- Dead-letter handling
- Observability

### Performance

Current:

- Shared analysis context
- Optimized database access patterns
- Redis infrastructure

Planned:

- AI response caching
- Background processing
- BullMQ
- Rate limiting
- Query optimization

---

## Production Engineering Phase

The core V1 AI capabilities are now implemented.

The next phase focuses on reliability, scalability, and operational maturity rather than adding more AI generation endpoints.

### Automated Testing

Planned coverage:

```text
Unit Tests
    │
    ├── Services
    ├── Prompt Builders
    ├── Validators
    └── Utilities

Integration Tests
    │
    ├── Repositories
    └── Database

E2E Tests
    │
    └── Complete User Workflow
```

Primary workflow:

```text
Register/Login
      ↓
Create Resume
      ↓
Create Job Description
      ↓
Create Analysis
      ↓
Generate Resume Review
      ↓
Generate Interview Questions
      ↓
Generate Cover Letter
```

### Background AI Processing

Future architecture:

```text
HTTP Request
     ↓
Create PENDING Job
     ↓
Queue
     ↓
Return Job / Request ID
     │
     ▼
Background Worker
     ↓
LLM Provider
     ↓
Validate Result
     ↓
PostgreSQL
     ↓
COMPLETED / FAILED
```

BullMQ and Redis are planned for this purpose.

### Retry, Idempotency & Failure Handling

Future AI processing will handle:

- Provider timeouts
- Rate limits
- Temporary provider errors
- Invalid JSON
- Validation failures
- Worker crashes

Planned lifecycle:

```text
PENDING
   ↓
PROCESSING
   ↓
 ┌───────────────┐
 │               │
 ▼               ▼
COMPLETED      FAILED
                 │
                 ▼
               RETRY
                 │
                 ▼
             FAILED / DLQ
```

### Future Redis Usage

Redis is planned for:

- AI response caching
- Queue infrastructure
- Rate limiting
- Short-lived workflow state

---

## Future RAG Architecture

RAG will allow AgentHire to retrieve relevant information from user-specific documents before generating responses.

```text
Resume / JD / Documents
          │
          ▼
       Chunking
          │
          ▼
      Embeddings
          │
          ▼
    Vector Database
          │
          ▼
   Relevant Context
          │
          ▼
          LLM
          │
          ▼
   Grounded Response
```

RAG will primarily support future conversational and agentic features.

---

## Future AI Conversation

A future conversational layer could allow users to ask:

```text
"Why is my match score only 72%?"

"Which skills am I missing for this role?"

"Why did you recommend changing my professional summary?"

"Which topics should I prepare for this interview?"

"Explain this job requirement based on my experience."
```

The conversation layer will eventually combine:

- RAG
- Analysis
- Resume Review
- Interview Questions
- Cover Letter
- MCP tools
- Agentic orchestration

---

## Future MCP Server

AgentHire is planned to expose selected capabilities through an MCP-compatible server.

Potential tools:

```text
get_resume
get_job_description
get_analysis
get_resume_review
get_interview_questions
get_cover_letter
```

This will allow AI agents to interact with AgentHire through structured tools rather than directly accessing internal services.

---

## Future Career Coach Agent

The long-term architecture introduces a Career Coach Agent as an orchestration layer.

```text
User:
"I want to apply for this backend engineering role."

                    │
                    ▼
             Career Coach Agent
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   Analysis    Resume Review   Interview
                                  │
                                  ▼
                              Preparation
```

The agent could eventually use:

- Resume tools
- Job description tools
- Analysis tools
- Resume review tools
- Interview tools
- RAG
- MCP
- LLM reasoning

---

## Roadmap

### V1 — Career Intelligence Core

- [x] Authentication
- [x] Resume Management
- [x] Job Description Management
- [x] Resume Analysis
- [x] ATS Analysis
- [x] Resume Review
- [x] Interview Question Generation
- [x] Cover Letter Generation

### V1.5 — Production Engineering

- [ ] Automated Unit Tests
- [ ] Integration Tests
- [ ] End-to-End Tests
- [ ] Background AI Processing
- [ ] BullMQ + Redis
- [ ] Retry & Failure Handling
- [ ] Idempotent AI Processing
- [ ] Rate Limiting
- [ ] AI Usage Tracking
- [ ] Observability
- [ ] Metrics
- [ ] Error Monitoring

### V2 — AI Intelligence Layer

- [ ] RAG
- [ ] Vector Database
- [ ] AI Conversation
- [ ] MCP Server
- [ ] Agentic Orchestration
- [ ] Career Coach Agent
- [ ] Multi-provider LLM Routing

### V3 — Platform

- [ ] Career Dashboard
- [ ] Resume Version Comparison
- [ ] Interview Practice
- [ ] Learning Progress Tracking
- [ ] Advanced Analytics
- [ ] Enterprise Features

---

## What AgentHire Is Not Trying to Do in V1

AgentHire intentionally avoids adding features simply for the sake of increasing the number of AI endpoints.

The current V1 does not include:

- Learning Roadmap generation
- Stored interview answers
- Mock interview scoring
- Voice interviews
- Multi-provider runtime routing
- Full conversational AI
- RAG
- MCP
- Career Coach Agent

These capabilities are planned for later phases where they provide meaningful product value.

---

## Engineering Philosophy

AgentHire is intentionally being built incrementally.

The goal is not to add as many AI features as possible.

Instead, the project focuses on demonstrating how to build a maintainable AI backend with:

- Clear domain boundaries
- Modular NestJS architecture
- Dependency Injection
- Repository pattern
- Provider abstraction
- Strong DTO validation
- Database integrity
- Secure resource ownership
- Reliable AI integration
- Structured LLM responses
- Asynchronous processing
- RAG
- MCP
- Agentic architecture

The project is designed to evolve from:

```text
AI-Powered Career Utilities
            │
            ▼
Career Intelligence Platform
            │
            ▼
AI Career Coach
```

---

## License

This project is developed as a portfolio project to demonstrate modern backend engineering, scalable software architecture, and AI-powered application development using NestJS, TypeScript, PostgreSQL, Redis, and Large Language Models.
