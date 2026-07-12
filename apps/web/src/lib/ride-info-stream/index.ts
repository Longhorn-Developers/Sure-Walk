import { DurableObject } from "cloudflare:workers";

export class RideInfoStream extends DurableObject<CloudflareEnv> {
  constructor(state: DurableObjectState, env: CloudflareEnv) {
    super(state, env);
  }
}
