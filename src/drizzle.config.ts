import { defineConfig } from 'drizzle-kit';
import { env } from './lib/env';


// In production, use the Vercel-generated POSTGRES_URL
// In development, use the direct DATABASE_URL
const connectionString = env.POSTGRES_URL ?? env.DATABASE_URL

export default defineConfig({
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
