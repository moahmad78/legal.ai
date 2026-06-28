# Production Checklist

Before signing off on the Vercel Production Environment, confirm:

## Infrastructure
- [ ] Vercel Environment Variables configured (Supabase + OpenAI).
- [ ] Vercel Custom Domain mapped and TLS generated.
- [ ] Supabase Edge functions enabled (if utilized in the future).
- [ ] Production Database scaled to accommodate the connection pool.

## Data & Security
- [ ] Supabase Row Level Security (RLS) tested for multitenancy.
- [ ] OpenAI Billing limits established to avoid DoS cost overruns.
- [ ] Supabase Storage buckets secured to authenticated uploads only.

## Front-End Quality
- [ ] `npm run build` succeeds securely.
- [ ] No `process.env.OPENAI_API_KEY` leaking to frontend bundles.
- [ ] Hydration checks passed: no nested `<button>` conflicts.
- [ ] Global Error Boundary (`src/app/error.tsx`) intercepts layout failures.
- [ ] Favicon, Robots.txt, and Sitemap.xml fully populated for SEO tracking.
