# Contributing

Welcome to Catalyst Legal AI! We appreciate all contributions to making this enterprise application more robust and feature-complete.

## Branch Strategy

We follow the standard GitHub Flow:
- `main`: The stable production branch. Directly linked to Vercel production deployments.
- `feature/*`: All new development must happen on feature branches off of `main`.
- `bugfix/*`: Reserved for resolving production defects.

## Coding Standards

1. **Language:** TypeScript exclusively. Do not bypass the type-checker with `any` unless absolutely unavoidable (and adequately documented).
2. **Components:** Next.js Server Components by default. Include `"use client"` only for islands of interactivity.
3. **Styling:** Tailwind CSS using `className` strings, managed with the `cn` utility to merge conditionals via `clsx` and `tailwind-merge`.
4. **State Management:** Prioritize URL parameters and Server Components over complex global client state like Redux or React Context, keeping the application stateless wherever possible.

## Commit Conventions

We enforce Conventional Commits to easily autogenerate CHANGELOGs.

Examples:
- `feat: add new PDF extraction pipeline`
- `fix: resolve hydration warning in dialog trigger`
- `docs: update ARCHITECTURE.md`
- `refactor: move global error boundary into root layout`
- `perf: implement dynamic import for HeavyChart component`

## Pull Request Checklist

Before submitting a Pull Request, ensure:
1. **Compilation Passes:** `npm run build` succeeds locally.
2. **Linting Passes:** `npm run lint` yields zero warnings.
3. **Types are Safe:** `npx tsc --noEmit` returns zero errors.
4. **Console is Clean:** No `console.log` debug statements have been left behind. Use `console.warn` or structured logging for production-grade telemetry.
5. **UI Tested:** Test empty states, loading states, and error handling for your feature.
