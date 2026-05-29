import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  migrations: {
      seed: 'npx tsx prisma/seed.ts',
    },
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})