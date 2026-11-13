-- ==============================================================================
-- SpendWise Supabase Database Schema
-- Run this script in the Supabase SQL Editor: Dashboard > SQL Editor > New query
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Create Schema Tables
-- ==============================================================================

-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY')),
    theme VARCHAR(20) NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
    has_seeded_data BOOLEAN NOT NULL DEFAULT FALSE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'MoreHorizontal',
    color VARCHAR(30) NOT NULL DEFAULT '#64748b',
    type VARCHAR(20) NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income', 'both')),
    is_custom BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Recurring Transactions Table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer')),
    note TEXT,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'weekly', 'yearly')),
    day_of_month SMALLINT NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date DATE NOT NULL,
    last_generated_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note VARCHAR(255),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer')),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit > 0),
    month VARCHAR(7), -- Optional YYYY-MM override or NULL for evergreen monthly budget
    alert_threshold SMALLINT NOT NULL DEFAULT 80 CHECK (alert_threshold BETWEEN 1 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_category_budget UNIQUE(user_id, category_id)
);

-- ==============================================================================
-- 3. High-Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_due ON public.recurring_transactions(user_id, next_due_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);

-- ==============================================================================
-- 4. Automatic updated_at Trigger Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_recurring_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Categories Policies (Users can access their own categories + global default categories if user_id is NULL)
CREATE POLICY "Users can view own and system categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can view their own budgets"
    ON public.budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
    ON public.budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON public.budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON public.budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Recurring Transactions Policies
CREATE POLICY "Users can view their own recurring transactions"
    ON public.recurring_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
    ON public.recurring_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
    ON public.recurring_transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
    ON public.recurring_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. New User Setup Trigger (Auto-creates Settings & Default Categories)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create default user settings
    INSERT INTO public.user_settings (user_id, currency, theme)
    VALUES (NEW.id, 'INR', 'system');

    -- 2. Populate standard categories for new user
    INSERT INTO public.categories (user_id, name, icon, color, type, is_custom) VALUES
        (NEW.id, 'Salary', 'Briefcase', '#10b981', 'income', FALSE),
        (NEW.id, 'Freelance & Bonus', 'Sparkles', '#06b6d4', 'income', FALSE),
        (NEW.id, 'Rent', 'Home', '#6366f1', 'expense', FALSE),
        (NEW.id, 'Food & Dining', 'Utensils', '#f97316', 'expense', FALSE),
        (NEW.id, 'Transport & Fuel', 'Car', '#3b82f6', 'expense', FALSE),
        (NEW.id, 'Shopping', 'ShoppingBag', '#ec4899', 'expense', FALSE),
        (NEW.id, 'Bills & Utilities', 'Zap', '#eab308', 'expense', FALSE),
        (NEW.id, 'Health & Medical', 'HeartPulse', '#ef4444', 'expense', FALSE),
        (NEW.id, 'Entertainment', 'Tv', '#8b5cf6', 'expense', FALSE),
        (NEW.id, 'Education', 'GraduationCap', '#14b8a6', 'expense', FALSE),
        (NEW.id, 'Other', 'MoreHorizontal', '#64748b', 'both', FALSE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute whenever a user registers via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
