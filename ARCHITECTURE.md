# Architecture

## Core Services
- **Frontend**: Next.js 15 (App Router) with React Server Components, Server Actions, and TailwindCSS.
- **State Management**: Zustand for local state (Chat UI, Guest sessions) and React Query for server state.
- **Authentication**: Clerk handles user identity. User records are synced to Supabase via Webhooks.
- **Database**: Supabase (PostgreSQL) stores `users`, `usage_logs`, `documents`, `reports`, and `chat_messages`.
- **Storage**: AWS S3 holds uploaded files securely.
- **AI/ML**: OpenAI (gpt-4o-mini) for document summaries, risk extraction, and interactive chat. Google Vision API for robust OCR on images and PDFs.

## Data Flow: Guest to User Migration
1. Guest visits site -> `guest_session_id` generated and saved in `localStorage`.
2. Guest uploads doc -> stored in DB linked to `guest_session_id`.
3. Guest signs up via Clerk.
4. Client-side `MigrationHandler` triggers `/api/migrate` with the session ID.
5. All documents and reports linked to the session ID are reassigned to the authenticated user's `internalUserId`.

## Billing Flow
1. User clicks "Upgrade" -> `/api/checkout` creates a Razorpay Subscription.
2. User completes payment via Razorpay Checkout script.
3. Razorpay webhook fires -> `/api/webhooks/razorpay` updates `subscriptions` table and upgrades `users.plan` to 'pro' or 'business'.
4. Usage logs track limits per plan.
