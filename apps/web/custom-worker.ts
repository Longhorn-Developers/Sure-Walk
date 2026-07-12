import handler from "./.open-next/worker";

export { RideInfoStream } from "./src/lib/ride-info-stream";

export default {
  fetch: handler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;
