import { AuthorizeRequest, CallbackRequest, CallbackResult, Provider, TokenRequest, TokenResult, User } from "../types";
import { marshalState, unmarshalState } from "../utils/state";

export class Google implements Provider {
  clientID: string
  clientSecret: string
  redirectURI: string

  constructor(clientID: string, clientSecret: string, redirectURI: string) {
    this.clientID = clientID
    this.clientSecret = clientSecret
    this.redirectURI = redirectURI
  }

  getAuthorizeURL(req: AuthorizeRequest): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    url.searchParams.append("access_type", "offline")
    url.searchParams.append("prompt", "select_account")
    url.searchParams.append("response_type", "code")
    url.searchParams.append("redirect_uri", this.redirectURI)
    url.searchParams.append("scope", Google.#convertScopeToGoogle(req.scope))
    url.searchParams.append("state", marshalState({clientID: req.clientID, state: req.state}))
    url.searchParams.append("client_id", this.clientID)
    return url.toString()
  }

  callback(req: CallbackRequest): CallbackResult {
    const scope = Google.#convertScopeFromGoogle(req.scope)
    const {clientID, state} = unmarshalState(req.state)
    return {
      clientID: clientID,
      state: state,
      scope: scope,
    }
  }

  async token(req: TokenRequest): Promise<TokenResult> {
    const params = new URLSearchParams()
    params.append("grant_type", req.grantType)
    params.append("redirect_uri", this.redirectURI)
    params.append("client_id", this.clientID)
    params.append("client_secret", this.clientSecret)
    params.append("code", req.code)
    const apiReq = new Request("https://accounts.google.com/o/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
    return fetch(apiReq)
      .then(resp => {
        if (resp.status != 200)
          throw new Error("Backend error")
        return resp.json()
      })
      .then(data => ({
        accessToken: data.access_token as string,
        tokenType: data.token_type as string,
        expiresIn: data.expires_in as number,
        refreshToken: data.refresh_token as string,
        scope: Google.#convertScopeFromGoogle(data.scope),
      }))
  }

  async userinfo(accessToken: string): Promise<User> {
    const apiReq = new Request("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        "Authorization": "Bearer " + accessToken,
      }
    })
    return fetch(apiReq)
      .then(resp => {
        if (resp.status != 200)
          throw new Error("Backend error")
        return resp.json()
      })
      .then(data => {
        if (!data.email_verified)
          throw new Error("User email not verified.")
        return {
          id: data.email as string,
          username: data.email as string,
          email: data.email as string,
          name: data.name as string,
          picture: data.picture as string,
        }
      })
  }

  static #convertScopeToGoogle(scope?: string): string {
    return "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
  }

  static #convertScopeFromGoogle(scope?: string): string {
    return "openid profile email"
  }
}