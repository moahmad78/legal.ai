# Architecture

Catalyst Legal AI is built using the official Supabase Next.js architecture alongside an Edge-capable OpenAI API wrapper. The system is designed to handle sensitive document storage and asynchronous LLM (Large Language Model) streaming concurrently.

## Authentication Flow

1. **Supabase SSR:** Authentication relies on the official `@supabase/ssr` package.
2. **Middleware Routing:** `src/middleware.ts` guards the `/app/*`, `/dashboard/*`, and other protected route layers by invoking `updateSession()`. This handles automatic session refreshing via cookies on every Next.js route hit.
3. **Session Rehydration:** When users visit an unprotected route (like `/sign-in`), if they carry a valid session, they are redirected automatically to `/app/chat`. Unauthenticated users hitting protected routes are safely redirected back to the sign-in page with a `redirect_url` appended.

## Data Flow & Storage Pipeline (Supabase)

1. **Storage Bucket:** Users upload legal documents (PDF/DOCX) natively via `src/app/api/upload/route.ts`.
2. **Server-Side Validation:** The API validates MIME types and buffers the file to S3 buckets managed by Supabase, generating a secure `storage_key`.
3. **Database Ledger:** A row is generated in the `documents` table with `status: "pending"` holding the `storage_key` and relational map to `client_id` and `matter_id`.
4. **Row Level Security:** Every table requires the `auth.uid()` constraint to ensure multi-tenant boundary integrity.

## Document Analysis Pipeline (OpenAI)

1. **Trigger:** Hitting `src/app/api/analyze/[documentId]/route.ts`.
2. **Execution Context:** The route is forced into `export const runtime = 'nodejs'` due to the heavy network parsing (Docx/PDF binary processing).
3. **Extraction & Chunking:** The system fetches the binary file from Supabase using a signed URL, extracts the textual contents, and passes it to the OpenAI API for LLM summary and structural data mapping.
4. **Conclusion:** Analysis JSON results are written directly to the `analysis` JSONB column on the `documents` table, and the status shifts to `completed`.

## Chat Architecture (RAG)

1. **Client Interface:** Reusable UI Chat Hooks (`use-authenticated-chat.ts`) emit streams from the Next.js API.
2. **Streaming AI:** `src/app/api/chat/[documentId]/route.ts` streams a conversational interface. By fetching the underlying document's analyzed chunks, it injects system prompts to narrow the context windows for the OpenAI `gpt-4o` completion API, ensuring grounded, accurate legal responses.

## Middleware Proxy Strategy

All Next.js Server Components and Server Actions utilize `createServerClient` bound strictly via `process.env.NEXT_PUBLIC_SUPABASE_URL`. Supabase Auth tokens are tightly bound to HttpOnly cookies using robust cookie parsers.
