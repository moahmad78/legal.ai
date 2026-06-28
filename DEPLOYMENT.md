# Deployment Guide

This guide covers the process of preparing and deploying Catalyst AI to Vercel.

## Pre-deployment Checklist
1. Ensure all environment variables listed in `ENVIRONMENT.md` are populated in your Vercel project settings.
2. Ensure you have run all database migrations against your production Supabase database.
3. Configure Clerk Webhooks to point to `https://your-domain.com/api/webhooks/clerk`.
4. Configure Razorpay Webhooks to point to `https://your-domain.com/api/webhooks/razorpay` and set the `RAZORPAY_WEBHOOK_SECRET`.

## Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. Select the Next.js framework preset.
3. Add the required environment variables.
4. Deploy!

### Rollback Procedure
If a production deployment fails or causes critical errors:
1. Go to your Vercel dashboard.
2. Navigate to "Deployments".
3. Find the previous stable deployment.
4. Click the "..." menu and select "Promote to Production".

## Backups & Recovery
- **Supabase**: Enable Point-in-Time Recovery (PITR) in your Supabase Pro project settings for automated daily backups.
- **S3 Storage**: Enable Object Versioning on your AWS S3 bucket to prevent accidental deletion.
- **Graceful Degradation**: If OpenAI is down, the system will mark document analysis as `failed` and display a clear error message to users without crashing the app.
