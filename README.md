# SSO Proxy

An SSO (OAuth 2.0) proxy on Cloudflare Workers.

It wraps other SSO providers and supports user restriction and user mapping.

## Scenario

- You don't need a full SSO for your websites; you want to use existing ones like Google and GitHub.
- You want to restrict the users who can log into your websites.

Voilà! Use this wrapper.

## Supported Providers

- [Google](https://developers.google.com/identity/protocols/oauth2)

## Deployment

Set up your Cloudflare account & install [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

1. Create a [D1](https://developers.cloudflare.com/d1/get-started/) database and import the SQL files in `sql`.
2. Modify `wrangler.toml` accordingly.
3. Run `wrangler deploy` to deploy the Worker.
4. Create an application on your backend provider. The callback URL is `https://<your_worker_domain>/callback`.
5. Run `wrangler secret <secret_name>` to add secrets (only necessary on the first deployment):
   - `SSO_CLIENT_ID`: the client ID you got from your provider.
   - `SSO_CLIENT_SECRET`: the client secret you got from your provider.

## Configuration

You can add applications (SSO clients) and authorized users via the D1 console on Cloudflare.

To add an application:
1. Open your database on the D1 console.
2. Add entries to the `clients` table:
   - The application uses `client_id` and `client_secret` for OAuth 2.0 authorization.
   - `redirect_uri` must be the same as the application's redirect URI.
3. Configure your application:
   - The client ID and client secret are as configured in the database.
   - The authorize URL is `https://<your_worker_domain>/authorize`.
   - The token URL is `https://<your_worker_domain>/token`.
   - The userinfo URL is `https://<your_worker_domain>/userinfo`.
   - Available fields in userinfo are `username`, `email`, `name` and `picture`.

To add an authorized user:
1. Open your database on the D1 console.
2. Add entries to the `users` table:
   - `id` is the ID column in the userinfo of the backend provider. For Google, it's the email address.
   - The other fields are optional. If set, they override the corresponding fields from the backend provider.
