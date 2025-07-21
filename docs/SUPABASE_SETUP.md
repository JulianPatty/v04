# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `workflow-editor` (or your preferred name)
   - Database Password: Save this securely!
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is fine for development

## 2. Get Your Database Credentials

1. Go to Project Settings > Database
2. Find the Connection String section
3. Copy the connection string (choose "Transaction" mode for better performance)
4. It will look like: `postgresql://postgres.[PROJECT-ID]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## 3. Update Environment Variables

1. Copy `.env.supabase.example` to `.env`:
   ```bash
   cp .env.supabase.example .env
   ```

2. Update the values in `.env` with your Supabase credentials:
   - Replace `[PROJECT-ID]` with your project ID
   - Replace `[YOUR-PASSWORD]` with your database password
   - Replace `[REGION]` with your project region

## 4. Optional: Supabase Auth & Storage

If you want to use Supabase Auth instead of your custom auth:

1. Go to Project Settings > API
2. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 5. Initialize Database Schema

### Option A: Using Drizzle Push (Recommended for Development)
```bash
bun db:push
```

### Option B: Using Migrations
```bash
bun db:generate
bun db:migrate
```

### Option C: Using Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Run the generated SQL from `drizzle/` folder

## 6. Enable Required Extensions

In Supabase SQL Editor, run:

```sql
-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 7. Connection Pooling

Supabase provides different connection strings:

- **Transaction Mode** (Recommended): For serverless/edge functions
  - Port: 6543
  - Best for Next.js API routes

- **Session Mode**: For long-lived connections
  - Port: 5432
  - Use if you need prepared statements

- **Direct Connection**: Bypasses pooler
  - Port: 5432
  - Only for migrations/admin tasks

## 8. Row Level Security (RLS)

By default, Supabase enables RLS. You have two options:

### Option A: Disable RLS (Development Only)
```sql
-- Run this for each table
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Option B: Configure RLS Policies (Recommended for Production)
```sql
-- Example policy for user table
CREATE POLICY "Users can view their own data" ON user
FOR SELECT TO authenticated
USING (auth.uid()::text = id);
```

## 9. Monitoring & Debugging

- Use Supabase Dashboard > Database > Query Performance
- Enable slow query logging in Project Settings
- Use Supabase Logs for debugging

## Troubleshooting

### Connection Issues
- Ensure your IP is whitelisted (Supabase allows all IPs by default)
- Check if you're using the correct connection string
- Verify your password doesn't contain special characters that need URL encoding

### Performance Tips
- Use connection pooling (Transaction mode) for serverless
- Create indexes for frequently queried columns
- Use Supabase's built-in caching where possible

### Migration Issues
- Ensure pgvector extension is enabled before running migrations
- Check that your Supabase plan supports the required extensions
- Use direct connection string for migrations if pooled connection fails