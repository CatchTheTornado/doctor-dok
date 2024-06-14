import { defineConfig } from 'drizzle-kit';
import path from 'path'
export default defineConfig({
  schema: './src/db/server/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
  dbCredentials: {
    url: process.env.DB_FILE ?? path.resolve(process.cwd()) + '/data/db.sqlite', // 👈 this could also be a path to the local sqlite file TODO: How to implement multi-tenant and database per user
  }
});
