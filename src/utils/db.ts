import { Client, User } from "../types";
import { Env } from "../index";

export const getClientByID = async (env: Env, clientID: string): Promise<Client | null> => {
  return env.DB.prepare("SELECT * FROM clients WHERE client_id = ?")
    .bind(clientID)
    .all()
    .then(resp => {
      if (!resp.success || !resp.results.length)
        return null
      const data = resp.results[0]
      return {
        clientID: data.client_id as string,
        clientSecret: data.client_secret as string,
        redirectURI: data.redirect_uri as string,
      }
    })
}

export const getUserByID = async (env: Env, id: string): Promise<User | null> => {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .all()
    .then(resp => {
      if (!resp.success || !resp.results.length)
        return null
      const data = resp.results[0]
      return {
        id: data.id as string,
        username: data.username as string,
        email: data.email as string,
        name: data.name as string ?? null,
        picture: data.picture as string ?? null,
      }
    })
}