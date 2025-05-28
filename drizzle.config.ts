import config from "@config/config";
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './src/core/db/models/*.models.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: config.dbConnect,
    },
})