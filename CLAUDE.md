# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chinese Flashcards (Vocab Sprint) is a full-stack Chinese language learning application built as a Bun monorepo with three apps:

- **apps/www** - Next.js 16 web application with interactive learning challenges
- **apps/db** - Prisma database layer with SQLite (shared across apps)
- **apps/asset-gen** - CLI scripts for generating audio/images using Google TTS and OpenAI

## Development Commands

### Package Manager
This project uses **Bun 1.2.4** exclusively. Do not use npm or yarn.

### Root Commands
```bash
bun install          # Install all dependencies
bun format:fix       # Format code with Biome
bun check:fix        # Lint and fix all issues
```

### www App (from apps/www)
```bash
bun run dev          # Start Next.js dev server
bun run build        # Production build
bun run storybook    # Start Storybook on port 6006
bun run tscheck      # TypeScript check without emit
```

### db App (from apps/db)
```bash
bun run dev          # Open Prisma Studio GUI
bun run generate     # Generate Prisma client after schema changes
bun run pull         # Pull schema and regenerate client
```

### Turbo Commands (from root)
```bash
turbo run build      # Build all apps (respects dependencies)
turbo run dev        # Run all dev servers
turbo run tscheck    # Type check all apps
```

## Architecture

### Database Schema
SQLite database at `apps/db/local.db` with these core models:
- **Course** → **Lesson** → **Drill** (hierarchical content structure)
- **Words** (Chinese characters, pinyin, meaning, HSK level 1-7)
- **Phrases** → **PhraseWords** (word combinations with ordering)

Drills contain both Words and Phrases for practice sessions.

### www App Structure
- **App Router** at `src/app/` with routes: `/courses`, `/dictionary`, `/user`, `/admin`
- **Challenge components** at `src/components/challenges/` - multiple interactive challenge types (audio, image, typing, pinyin, sentence building, etc.)
- **State management** via Zustand in `src/utils/playerState.ts` - handles user progress with localStorage persistence
- **API routes** use Hono framework in `/admin/api/[[...route]]/route.dev.ts`

### Dev-Only Files
Files with `.dev.ts` or `.dev.tsx` extensions are only included in development builds (configured in next.config.ts).

### Workspace Imports
Import the Prisma client from the db package:
```typescript
import { prisma } from "vocab-db/prisma";
```

## Code Style

- **Biome** for formatting (2 spaces, 110 line width) and linting
- Use `cn()` from `@/utils/cn` for Tailwind class merging
- React Server Components by default; use `"use client"` directive only when needed
- Zod for validation in API routes with `@hono/zod-validator`
