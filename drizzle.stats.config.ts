import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/data/server/db-schema-stats.ts',
  out: './drizzle-stats',
  dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
});
