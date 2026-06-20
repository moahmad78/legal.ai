-- Migration: update_billing_schema
-- Description: Updates subscriptions with billing_frequency and creates billing_transactions

-- 1. Add billing_frequency
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS billing_frequency TEXT DEFAULT 'monthly';

-- 2. Create billing_transactions table
CREATE TABLE IF NOT EXISTS public.billing_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT,
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    payment_method TEXT,
    razorpay_payment_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indexes for billing_transactions
CREATE INDEX IF NOT EXISTS idx_billing_tx_org_id ON public.billing_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_tx_sub_id ON public.billing_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_tx_status ON public.billing_transactions(status);
CREATE INDEX IF NOT EXISTS idx_billing_tx_invoice ON public.billing_transactions(invoice_number);

-- 4. Idempotency tracking for Webhooks
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
