# React Flow Workflow Editor - Project Memory

## Project Overview
- **Name**: React Flow Workflow Editor (v04)
- **Repository**: https://github.com/JulianPatty/v04.git
- **Framework**: Next.js 15.4.1 with TypeScript
- **Runtime**: Bun (not Node.js)
- **Styling**: Tailwind CSS v4 with shadcn/ui components

## Key Technologies
- **Frontend**: React 19.1.0, React Flow (@xyflow/react), Framer Motion
- **Database**: PostgreSQL with Drizzle ORM, pgvector for embeddings
- **Authentication**: Supabase with Better Auth
- **Real-time**: Socket.IO with Redis adapter
- **Payments**: Stripe
- **Email**: Resend
- **Testing**: Vitest with Testing Library
- **Linting**: Biome (ESLint removed)

## Important Configuration
- **Database URL**: Use `POSTGRES_URL` in production (Vercel), `DATABASE_URL` in development
- **Environment Config**: Centralized in `src/lib/env.ts` using @t3-oss/env-nextjs
- **Drizzle Config**: Located at `src/drizzle.config.ts`
- **Socket.IO**: Requires separate server deployment

## Project Structure
```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (landing)/       # Landing pages
│   └── workspace/       # Main application
├── blocks/              # Workflow block definitions
├── components/
│   └── ui/             # Shadcn UI components
├── contexts/           # React contexts (auth, socket)
├── db/                 # Database schema and migrations
├── executor/           # Workflow execution engine
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── middleware/         # Auth and other middleware
├── stores/             # Zustand stores
└── utils/              # Helper functions
```

## Recent Changes
1. Moved from npm to Bun package manager
2. Set up comprehensive environment variable management
3. Added Socket.IO for real-time collaboration
4. Implemented 38-table database schema
5. Added UI components: Avatar, Tabs, Alert Dialog
6. Installed testing framework (Vitest)
7. Added payment processing (Stripe)
8. Configured email service (Resend)

## Deployment Notes
- **Vercel Build Command**: `bun run build`
- **Vercel Install Command**: `bun install`
- **Output Directory**: `.next`
- **Node Version**: 20.x or latest LTS

## Environment Variables Required
### Server-side
- DATABASE_URL / POSTGRES_URL
- BETTER_AUTH_URL
- BETTER_AUTH_SECRET
- ENCRYPTION_KEY
- INTERNAL_API_SECRET
- REDIS_URL (optional)
- STRIPE_SECRET_KEY (optional)
- RESEND_API_KEY (optional)

### Client-side
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SOCKET_URL (optional)
- NEXT_PUBLIC_GOOGLE_CLIENT_ID (for Google Drive Picker)
- NEXT_PUBLIC_GOOGLE_API_KEY (for Google Drive Picker)

## Pending Major Tasks
1. Configure Google Drive Picker API
2. Complete authentication flow implementation
3. Deploy Socket.IO server for real-time features
4. Implement React Flow workflow editor
5. Set up Stripe payment integration
6. Configure production database and migrations
7. Write tests for core functionality

## Known Issues
- Socket.IO server needs separate deployment
- Some Supabase client files were moved/deleted - using utils/supabase instead
- Need to configure pgvector extension in production database

## Development Commands
```bash
bun run dev          # Start development server
bun test            # Run tests with Vitest
bun run build       # Build for production
bun run lint        # Run Biome linter
bun run db:push     # Push database schema
bun run db:studio   # Open Drizzle Studio
```