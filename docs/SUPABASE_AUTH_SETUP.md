# Supabase Authentication Setup

## Overview

This project is configured with Supabase Authentication supporting:
- Email/Password authentication
- OAuth providers (Google, GitHub)
- Protected routes
- Session management

## Configuration Steps

### 1. Enable Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider (enabled by default)
4. Configure OAuth providers:
   - **Google**: Add your Google OAuth credentials
   - **GitHub**: Add your GitHub OAuth credentials

### 2. Configure Redirect URLs

Add these URLs to your OAuth provider settings:

```
https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
http://localhost:3000/auth/callback (for local development)
```

### 3. Update Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the confirmation, reset password, and magic link emails
3. Add your app branding

### 4. Configure Auth Settings

In Authentication > Settings:
- Set site URL to your production URL
- Add redirect URLs:
  - `http://localhost:3000/*`
  - `https://your-production-url.com/*`

## Usage

### Sign Up
```typescript
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

### Sign In
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### OAuth Sign In
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'github'
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut()
```

## Protected Routes

Wrap any component that requires authentication with `ProtectedRoute`:

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      {/* Your protected content */}
    </ProtectedRoute>
  )
}
```

## Auth Context

Access authentication state anywhere in your app:

```tsx
import { useAuth } from '@/contexts/auth-context'

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Welcome {user.email}</div>
}
```

## Database Integration

When a user signs up, Supabase automatically creates a record in the `auth.users` table. You can reference this in your custom tables:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## Troubleshooting

### Email not sending
- Check spam folder
- Verify SMTP settings in Supabase dashboard
- Use Supabase's built-in email service for testing

### OAuth redirect issues
- Ensure redirect URLs are correctly configured in both Supabase and OAuth provider
- Check that your OAuth credentials are correct

### Session persistence
- Sessions are automatically refreshed by the Supabase client
- The middleware ensures sessions are refreshed on each request

## Security Best Practices

1. Always use HTTPS in production
2. Enable RLS on all tables
3. Validate user permissions server-side
4. Use environment variables for sensitive data
5. Implement rate limiting for auth endpoints