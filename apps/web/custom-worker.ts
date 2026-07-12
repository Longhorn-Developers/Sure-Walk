import { default as handler } from "./.open-next/worker";

export default {
  fetch: handler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;

export { RideInfoStream } from "./src/lib/ride-info-stream";
