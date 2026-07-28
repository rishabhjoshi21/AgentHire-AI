# AgentHire AI

> **AgentHire** is an AI-powered Career Intelligence Platform that helps job seekers analyze resumes, improve ATS compatibility, prepare for interviews, and build personalized learning roadmaps using Large Language Models (LLMs) and a modular AI service architecture.

---

# Vision

Modern hiring is increasingly driven by Applicant Tracking Systems (ATS), keyword filtering, and highly competitive recruitment processes. Many qualified candidates never reach the interview stage because they lack visibility into how their resumes are evaluated.

AgentHire bridges this gap by providing AI-powered career guidance through intelligent resume analysis, personalized interview preparation, and learning recommendations.

Instead of relying on a monolithic AI workflow, AgentHire follows a modular architecture where every AI capability is implemented as an independent service. This makes the platform scalable, maintainable, and ready for future agentic orchestration through a Career Coach Agent.

---

# Project Goals

- Analyze resumes against job descriptions
- Calculate ATS compatibility scores
- Identify missing skills and keywords
- Recommend resume improvements
- Generate role-specific interview questions
- Create personalized learning roadmaps
- Support multiple LLM providers through a provider abstraction layer
- Demonstrate production-grade backend architecture
- Provide a foundation for a future AI-powered Career Coach Agent

---

# Functional Requirements

| ID    | Requirement                        | Status         |
| ----- | ---------------------------------- | -------------- |
| FR-01 | User Registration & Authentication | ✅ Completed   |
| FR-02 | Upload & Manage Resumes            | ✅ Completed   |
| FR-03 | Upload & Manage Job Descriptions   | ✅ Completed   |
| FR-04 | AI Resume Analysis                 | ✅ Completed   |
| FR-05 | ATS Compatibility Analysis         | ✅ Completed   |
| FR-06 | Resume Review & Improvement        | 🚧 In Progress |
| FR-07 | Interview Question Generation      | 🚧 In Progress |
| FR-08 | Personalized Learning Roadmap      | 🚧 In Progress |
| FR-09 | Career Coach Agent                 | 📅 Planned     |

---

# Non-Functional Requirements

## Scalability

- Modular feature-based architecture
- Stateless REST APIs
- Independent AI provider layer

## Maintainability

- SOLID Principles
- Dependency Injection
- Reusable AI services
- Provider abstraction

## Reliability

- Structured exception handling
- Retry mechanism for LLM requests
- Consistent JSON responses

## Performance

- Redis caching
- Optimized database queries
- Asynchronous processing support

## Security

- JWT Authentication
- Password hashing
- DTO validation
- Secure API key management

---

# Technology Stack

| Layer               | Technology     |
| ------------------- | -------------- |
| Backend             | NestJS         |
| Language            | TypeScript     |
| Database            | PostgreSQL     |
| ORM                 | Prisma         |
| AI                  | Google Gemini  |
| Future AI Providers | OpenAI, Claude |
| Cache               | Redis          |
| Authentication      | JWT, Passport  |
| Containerization    | Docker         |
| API Documentation   | Swagger        |

---

# Getting Started

## Prerequisites

- Node.js 22+
- PostgreSQL
- Redis

## Installation

```bash
git clone <repository-url>
cd agenthire
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

---

# Unified System Architecture

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
      ┌─────────────────────────────────┼──────────────────────────────────┐
      ▼                                 ▼                                  ▼
 Authentication Module          Resume Module                Job Description Module
                                        │
                                        ▼
                              Resume Analysis Service
                                        │
                           Stores Analysis Result
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
 Resume Review Service      Interview Preparation Service      Learning Roadmap Service
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        ▼
                               LLM Provider Layer
                                        │
                      ┌─────────────────┼─────────────────┐
                      ▼                 ▼                 ▼
                  Gemini             OpenAI             Claude
                 (Current)          (Future)          (Future)
                                        │
                                        ▼
                             Structured JSON Response
                                        │
                                        ▼
                                  PostgreSQL
                                        │
                                        ▼
                                  REST Response

──────────────────────────────────────────────────────────────────────────────

                          Future Capability

                         Career Coach Agent
                                  │
                  Understand User Goal & Context
                                  │
                 Decide Which Services To Execute
                                  │
 Resume Review • Interview Preparation • Learning Roadmap
```

---

# Current Project Status

## ✅ Completed

- Authentication Module
- User Management
- Resume Management
- Job Description Management
- Resume Analysis
- ATS Compatibility Analysis
- Gemini Integration
- Provider Abstraction Layer

## 🚧 In Progress

- Resume Review Service
- Interview Preparation Service
- Learning Roadmap Service
- Prompt Engineering
- Docker Configuration
- Swagger Documentation

## 📅 Planned

### AI Features

- Career Coach Agent
- Multi-LLM Runtime Selection
- AI Response Caching
- Conversation History

### Infrastructure

- CI/CD Pipeline
- Monitoring
- Logging
- Background Job Processing

### Platform Features

- Career Dashboard
- Resume Version Comparison
- Learning Progress Tracking

---

# Future Roadmap

## Version 1.0

- Authentication
- Resume Upload
- Job Description Upload
- Resume Analysis
- Resume Review
- Interview Preparation
- Learning Roadmap

## Version 2.0

- Career Coach Agent
- Multi-Provider LLM Routing
- Personalized Career Dashboard

## Version 3.0

- Enterprise Features
- Analytics Dashboard

---

# License

This project is developed as a portfolio project to demonstrate modern backend engineering, scalable software architecture, and AI-powered application development using NestJS, TypeScript, PostgreSQL, Redis, and Large Language Models.
