import { Provider } from "../types";
import { Google } from "./google";

export function getProvider(name: string, clientID: string, clientSecret: string, redirectURI: string): Provider {
  switch (name) {
    case "google":
      return new Google(clientID, clientSecret, redirectURI)
    default:
      throw new Error(`Unknown provider ${name}`)
  }
}