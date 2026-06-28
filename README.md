# Catalyst Legal AI

Catalyst Legal AI is an enterprise-grade web application designed to empower legal professionals with advanced artificial intelligence. It streamlines document analysis, client management, and provides specialized AI-driven chat capabilities over complex legal datasets.

## Features

- **Authentication & Security:** Robust authentication powered by Supabase with Row Level Security (RLS).
- **Document Analysis:** Upload, parse, and deeply analyze legal documents using state-of-the-art OpenAI models.
- **AI Chat Interface:** Context-aware conversations across legal documents utilizing specialized Retrieval-Augmented Generation (RAG) pipelines.
- **Client & Matter Management:** Comprehensive tracking for legal clients and their active legal matters.
- **Enterprise Ready:** Next.js App Router, fully typed Server Components, edge-ready middleware, and highly optimized edge caching.

## Technology Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Edge Middleware)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI Primitives (via Base UI)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Storage)
- **AI & LLM:** OpenAI API
- **Deployment:** Vercel

## Folder Structure

```
├── src/
│   ├── app/           # Next.js App Router endpoints and API Routes
│   ├── components/    # Reusable React components (UI, Chat, Dashboard)
│   ├── hooks/         # Shared custom React hooks
│   ├── lib/           # Utility functions, instances (Supabase, OpenAI)
│   ├── services/      # Business logic services (AI analysis, document handling)
│   └── types/         # Global TypeScript definitions
├── public/            # Static assets
└── package.json       # Dependencies and build scripts
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/moahmad78/legal.ai.git
   cd legal.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENAI_API_KEY=...
   RESEND_API_KEY=...
   ```

4. **Run Local Development Server**
   ```bash
   npm run dev
   ```

## Build Commands

- **Development:** `npm run dev`
- **Build Production:** `npm run build`
- **Lint:** `npm run lint`
- **Type Check:** `npx tsc --noEmit`

## Deployment Steps

1. Connect the repository to your Vercel project.
2. Configure the environment variables within the Vercel dashboard.
3. Vercel will automatically trigger a production build on every push to the `main` branch.

## Production Checklist

- [ ] All environment variables are securely added.
- [ ] Supabase RLS policies are active and verified.
- [ ] Error boundaries are configured to catch silent frontend failures.
- [ ] Database indexes are optimized for `documents` and `clients`.

## Troubleshooting Guide

- **Edge Runtime Warnings:** Warnings stating `A Node.js API is used (process.version)...` during build are known static analysis warnings from the official Supabase SSR package and do not affect runtime stability.
- **Hydration Errors:** Ensure standard browser extensions are not injecting conflicting HTML in the App Router.
- **Document Analysis Failing:** Check `OPENAI_API_KEY` validity and ensure the Supabase Storage Bucket has public Read permissions for correctly structured requests.
