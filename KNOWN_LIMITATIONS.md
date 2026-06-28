# Known Limitations & Technical Debt

This document catalogs non-blocking architectural constraints and technical debt to track for the future roadmap.

## 1. Third-Party Edge Compatibility Warning
- **Supabase Edge Warning**: The terminal may log `A Node.js API is used (process.version)` when executing Next.js builds regarding `@supabase/supabase-js`. This is a statically evaluated warning upstream and does not execute during Edge proxying, leaving production stability unaffected. 

## 2. API Computation Limits
- **Document Analysis (`/api/analyze`)**: Currently operates via heavy buffer streaming directly onto the `nodejs` runtime within Next.js API Routes. If documents scale beyond `30MB`, Next.js 15 internal serverless compute boundaries might hit out-of-memory constraints.
- *Mitigation strategy*: Decouple extraction pipelines into a background worker (e.g., Supabase Edge Functions or an external microservice queue).

## 3. Analytics & Logging
- **Current State**: Analytics events use local API stubbing (`console.log`).
- *Mitigation strategy*: Fully integrate `PostHog` or `Segment` using the existing `src/lib/analytics.ts` signatures. Sentry needs formal DSN activation for tracing.

## 4. Testing Suite
- **Unit Tests**: The system currently lacks a comprehensive Jest or Vitest test suite. E2E verification is manual. Future cycles must prioritize robust component and integration tests.
