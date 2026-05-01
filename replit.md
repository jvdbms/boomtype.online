# Workspace

## Overview

pnpm workspace monorepo using TypeScript. BoomType is a full-stack typing tutor SaaS platform with real-time WPM testing, leaderboards, gamification, viral sharing, certificates, and a premium/freemium model.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/boomtype) — deployed at `/`
- **API framework**: Express 5 (artifacts/api-server) — deployed at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Styling**: Tailwind CSS v4 + Inter + JetBrains Mono fonts
- **Animation**: Framer Motion

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## BoomType Features

- **Typing Test Engine**: Real-time WPM, accuracy, live character highlighting (green/red), 30s/60s modes
- **Leaderboard**: Daily/Weekly/All-Time with database-backed rankings from /api/leaderboard
- **Gamification**: XP system, levels (Beginner/Intermediate/Pro/Master), streaks, achievement badges
- **Viral Sharing**: WhatsApp/Facebook/Twitter/Copy share buttons with pre-filled text
- **Certificates**: Print-to-PDF certificate generation with user stats and BoomType branding
- **Premium Page**: Freemium pricing UI ($0 vs $4.99/mo)
- **Ad Placeholders**: AdSense-ready banner placeholders (top banner, mid-page, result page)
- **SEO**: Each page sets unique document.title and meta description
- **Pages**: Home, Test, Results, Leaderboard, Lessons, Blog, Premium, About, Privacy, Terms, Contact

## DB Schema

- `scores` table: id, nickname, wpm, accuracy, duration, mistakes, created_at

## API Endpoints

- `GET /api/healthz` — health check
- `POST /api/scores` — submit typing test score
- `GET /api/leaderboard?period=daily|weekly|all_time&limit=10` — leaderboard
- `GET /api/stats/summary` — platform-wide stats
- `GET /api/stats/recent` — recent test completions
- `GET /api/users/:nickname` — user profile and personal bests

## Color System (Dark Mode Primary)

- Background: `222 47% 7%` (deep navy)
- Primary: `220 92% 60%` (electric blue)
- Accent: `263 70% 60%` (neon purple)
- Card: `220 40% 10%`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
