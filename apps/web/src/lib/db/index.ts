import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";

export const getDB = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.LIFTS_DB);
});

export const getDBInWorker = cache((env: CloudflareEnv) => {
  return drizzle(env.LIFTS_DB);
});
