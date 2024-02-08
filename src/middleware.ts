import { Handler } from "./types";
import { getClientByID } from "./utils/db";

export const withClient: Handler = async ({env, req}) => {
  const clientID = req.method == "GET" ? req.query.client_id : (await req.formData()).get("client_id")
  if (!clientID) {
    return new Response("Client ID not specified.", {
      status: 400,
    })
  }
  const client = await getClientByID(env, clientID)
  if (client === null)
    return new Response("Client not found.", {
      status: 400,
    })
  req.client = client
}