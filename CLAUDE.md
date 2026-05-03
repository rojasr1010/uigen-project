# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude AI generates functional, styled React components in real-time. The core innovation is a **virtual file system** — no files are written to disk; everything lives in memory.

## Development Commands

```bash
npm run setup        # First-time setup: install deps + Prisma client + migrations
npm run dev          # Start dev server with Turbopack on port 3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Reset database (destructive)
```

To run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

## Environment Variables

```
ANTHROPIC_API_KEY=   # Optional — without it, falls back to MockLanguageModel with static responses
JWT_SECRET=          # Optional — defaults to "development-secret-key"
DATABASE_URL=        # SQLite path, default: prisma/dev.db
```

## Architecture

### Core Data Flow

1. User submits chat message → `ChatContext` (`lib/contexts/chat-context.tsx`) via Vercel AI SDK
2. Request hits `POST /api/chat` endpoint (`app/api/chat/route.ts`)
3. System prompt (from `lib/prompts/generation.tsx`) + AI tools injected
4. Claude streams a response using two tools: `str_replace_editor` and `file_manager`
5. Tool calls mutate the `VirtualFileSystem` in `FileSystemContext` in real-time
6. Updated files appear in the Monaco editor and live preview immediately
7. Final state serialized to Prisma DB (if authenticated)

### VirtualFileSystem (`lib/file-system.ts`)

The `VirtualFileSystem` class is central to everything. It holds an in-memory `Map<path, FileNode>` of all generated component files. Tool handlers in `lib/tools/` call methods on this class to create, read, update, delete, and rename files. It can serialize/deserialize for database persistence. **No files are ever written to disk.**

### AI Tools (`lib/tools/`)

- `str-replace.ts` — Implements `str_replace_editor`: reads/writes/patches file content in the virtual FS
- `file-manager.ts` — Implements `file_manager`: rename, delete, move operations on the virtual FS

### State Management

Two primary React contexts (no external state library):
- `ChatContext` (`lib/contexts/chat-context.tsx`) — messages, streaming status, input state via `useChat` from `ai` (Vercel AI SDK)
- `FileSystemContext` (`lib/contexts/file-system-context.tsx`) — `VirtualFileSystem` instance, selected file, tool execution callbacks

### UI Layout (`app/main-content.tsx`)

Three-panel resizable layout using `react-resizable-panels`:
1. **Left (35%)** — Chat interface
2. **Right-top** — Live preview (`PreviewFrame`) renders JSX in an iframe using `@babel/standalone`
3. **Right-bottom** — File tree + Monaco code editor

### Authentication (`lib/auth.ts`, `middleware.ts`)

JWT sessions stored in HTTP-only cookies (7-day expiry) using `jose`. Auth is optional — anonymous sessions work with `anon-work-tracker.ts` to avoid losing work. Passwords hashed with `bcrypt`.

### Language Model (`lib/provider.ts`)

Returns either the real `@ai-sdk/anthropic` model (`claude-haiku-4-5`) or a `MockLanguageModel` when no `ANTHROPIC_API_KEY` is set. The mock returns static component templates. **System prompt uses prompt caching** (ephemeral cache control on the system message).

### Database (`prisma/schema.prisma`)

SQLite via Prisma with two models:
- `User` — email, bcrypt password
- `Project` — name, messages (JSON), data (serialized VirtualFileSystem JSON), optional userId (cascade delete)

Server actions in `src/actions/` handle project CRUD.

### JSX Transform (`lib/transform/jsx-transformer.ts`)

Compiles JSX strings for the live preview using `@babel/standalone` (runs in the browser, no server-side compilation needed).
