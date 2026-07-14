# AGENTS

## Purpose

This repository contains a backend service built with NestJS and Prisma. Use this file to understand the project structure, build/test commands, and the conventions that matter most for AI coding agents.

## Project overview

- Backend-only Node.js application using NestJS v11 and TypeScript.
- Application entrypoint: `src/main.ts`.
- Root module: `src/app.module.ts`.
- Database access via Prisma in `src/infrastructure/database/prisma`.
- Shared configuration and validation live in `src/shared/config`.
- Domain and feature modules are organized under `src/modules`.

## Key commands

- `npm install`
- `npm run build`
- `npm run start`
- `npm run start:dev`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`

## Environment requirements

The app loads `.env` using `dotenv` and validates environment variables with `src/shared/config/env.config.ts`.
Required values:

- `NODE_ENV`: `development`, `production`, or `test`
- `PORT`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`

## Conventions for agents

- Treat this repo as a backend NestJS service, not a frontend app.
- Preserve existing config and module structure.
- Add new features through NestJS modules/services/providers under `src/modules` and `src/infrastructure`.
- Use `PrismaModule` and `PrismaService` for database access.
- Keep environment validation in sync with `src/shared/config/env.config.ts` when adding env vars.
- Prefer `README.md`, `package.json`, and `prisma/schema.prisma` for detailed project context instead of duplicating documentation.

## Useful references

- `README.md`
- `package.json`
- `prisma/schema.prisma`
- `src/main.ts`
- `src/app.module.ts`
- `src/shared/config/env.config.ts`
- `src/infrastructure/database/prisma/prisma.module.ts`
