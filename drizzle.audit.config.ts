import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/data/server/db-schema-audit.ts',
  out: './drizzle-audit',
  dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
});
