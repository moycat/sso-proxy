import { AuthorizeRequest, CallbackRequest, Handler, TokenRequest } from "./types";
import { getClientByID, getUserByID } from "./utils/db";

export const authorizeHandler: Handler = async ({req, provider}) => {
  const request: AuthorizeRequest = {
    clientID: req.query.client_id,
    redirectURI: req.query.redirect_uri,
    state: req.query.state ?? undefined,
    scope: req.query.scope ?? undefined,
    responseType: req.query.response_type,
  }
  if (request.responseType !== "code")
    return new Response("Only authorization code mode is supported.", {
      status: 400,
    })
  if (request.redirectURI != req.client.redirectURI)
    return new Response("Redirect URI does not match.", {
      status: 400,
    })
  const redirectURI = provider.getAuthorizeURL(request)
  return Response.redirect(redirectURI, 302)
}

export const callbackHandler: Handler = async ({env, req, provider}) => {
  const request: CallbackRequest = {
    code: req.query.code,
    state: req.query.state,
    scope: req.query.scope ?? undefined,
  }
  if (!request.code)
    return new Response("Code is missing.", {
      status: 400,
    })
  if (!request.state)
    return new Response("State is missing.", {
      status: 400
    })
  const result = provider.callback(request)
  const client = await getClientByID(env, result.clientID)
  if (!client)
    return new Response("Client not found.", {
      status: 400,
    })
  // Compose the redirect URI to the app.
  const url = new URL(client.redirectURI)
  url.searchParams.append("code", request.code)
  if (result.state)
    url.searchParams.append("state", result.state)
  if (result.scope)
    url.searchParams.append("scope", result.scope)
  return Response.redirect(url.toString(), 302)
}

export const tokenHandler: Handler = async ({env, req, provider}) => {
  const form = await req.formData()
  const request: TokenRequest = {
    grantType: form.get("grant_type") as string,
    redirectURI: form.get("redirect_uri") as string,
    clientID: form.get("client_id") as string,
    clientSecret: form.get("client_secret") as string,
    code: form.get("code") as string,
  }
  if (request.grantType !== "authorization_code")
    return new Response("Only authorization code mode is supported.", {
      status: 400,
    })
  if (request.clientSecret !== req.client.clientSecret)
    return new Response("Wrong client secret.", {
      status: 403,
    })
  if (request.redirectURI != req.client.redirectURI)
    return new Response("Redirect URI does not match.", {
      status: 400,
    })
  // Get the access key & check the user.
  const result = await provider.token(request)
  if (result.tokenType != "Bearer")
    return new Response("Only bearer token is supported", {
      status: 400,
    })
  const user = await provider.userinfo(result.accessToken)
  const authorizedUser = await getUserByID(env, user.id)
  if (!authorizedUser)
    return new Response("User not authorized.", {
      status: 403,
    })
  return Response.json({
    access_token: result.accessToken,
    token_type: result.tokenType,
    expires_in: result.expiresIn,
    refresh_token: result.refreshToken,
    scope: result.scope,
  })
}

export const userinfoHandler: Handler = async ({env, req, provider}) => {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader)
    return new Response("No token found.", {
      status: 400,
    })
  const accessToken = authHeader.replace(/^Bearer /,"")
  const user = await provider.userinfo(accessToken)
  const authorizedUser = await getUserByID(env, user.id)
  if (!authorizedUser)
    return new Response("User not authorized.", {
      status: 403,
    })
  if (authorizedUser.username)
    user.username = authorizedUser.username
  if (authorizedUser.email)
    user.email = authorizedUser.email
  if (authorizedUser.name)
    user.name = authorizedUser.name
  if (authorizedUser.picture)
    user.picture = authorizedUser.picture
  return Response.json(user)
}