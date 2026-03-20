import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default !process.env.LOCAL_DB_PATH
  ? defineConfig({
      out: "./drizzle",
      dialect: "sqlite",
      schema: "./src/lib/db/schema",
      driver: "d1-http",
      dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
        token: process.env.CLOUDFLARE_D1_TOKEN!,
      },
    })
  : defineConfig({
      dialect: "sqlite",
      out: "./drizzle",
      schema: "./src/lib/db/schema",
      dbCredentials: {
        url: process.env.LOCAL_DB_PATH,
      },
    });
