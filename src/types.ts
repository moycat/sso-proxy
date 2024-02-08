import { RouterHandler } from "@tsndr/cloudflare-worker-router";
import { Env, ExtCtx, ExtReq } from "./index";

export abstract class Provider {
  abstract getAuthorizeURL(req: AuthorizeRequest): string
  abstract callback(req: CallbackRequest): CallbackResult
  abstract async token(req: TokenRequest): Promise<TokenResult>
  abstract async userinfo(accessToken: string): Promise<User>
}

export type Client = {
  clientID: string
  clientSecret: string
  redirectURI: string
}

export type User = {
  id: string
  username?: string
  email?: string
  name?: string
  picture?: string
}

export type Handler = RouterHandler<Env, ExtCtx, ExtReq>

export type AuthorizeRequest = {
  clientID: string
  redirectURI: string
  state?: string
  scope?: string
  responseType: string
}

export type CallbackRequest = {
  code: string
  state: string
  scope?: string
}

export type CallbackResult = {
  clientID: string
  state?: string
  scope?: string
}

export type TokenRequest = {
  grantType: string
  redirectURI: string
  clientID: string
  clientSecret: string
  code: string
}

export type TokenResult = {
  accessToken: string
  tokenType: string
  expiresIn?: number
  refreshToken?: string
  scope?: string
}
