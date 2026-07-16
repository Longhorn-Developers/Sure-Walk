// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from "./.open-next/worker";
import { apiRideEvents } from "@/lib/ride-info-stream/worker";

export default {
  async fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: unknown,
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/ride/events")) {
      return await apiRideEvents(request, env);
    }

    return handler.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<CloudflareEnv>;

export { RideInfoStream } from "./src/lib/ride-info-stream";
