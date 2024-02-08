import { Router } from '@tsndr/cloudflare-worker-router'
import { Client, Provider } from "./types";
import { getProvider } from "./providers";
import { authorizeHandler, callbackHandler, tokenHandler, userinfoHandler } from "./oauth2";
import { withClient } from "./middleware";

export interface Env {
  DB: D1Database

  SSO_PROVIDER: string
  SSO_CLIENT_ID: string
  SSO_CLIENT_SECRET: string
  SSO_REDIRECT_URI: string
}

export type ExtCtx = {
  provider: Provider
}

export type ExtReq = {
  client: Client
}

const router = new Router<Env, ExtCtx, ExtReq>()

// Routes.
router.get("/authorize", withClient, authorizeHandler)
router.post("/token", withClient, tokenHandler)
router.get("/callback", callbackHandler)
router.get("/userinfo", userinfoHandler)

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const provider = getProvider(env.SSO_PROVIDER, env.SSO_CLIENT_ID, env.SSO_CLIENT_SECRET, env.SSO_REDIRECT_URI)
    const ctxExt: ExtCtx = {provider: provider}
    return router.handle(request, env, ctx, ctxExt)
  }
}
