import { remoteConfig } from "./firebase";
import {
  fetchAndActivate,
  getValue,
} from "firebase/remote-config";

/**
 * Fetches and activates all remote configurations, then retrieves the value
 * of the "languages" key from the remote configuration and parses it as JSON.
 *
 * @returns A promise that resolves to the parsed JSON object from the "languages"
 * key in the remote configuration, or `null` if an error occurs.
 */
export const fetchAllRemoteConfig = async (): Promise<
  unknown | null
> => {
  try {
    await fetchAndActivate(remoteConfig);
    const configString = getValue(
      remoteConfig,
      "languages"
    ).asString();
    return JSON.parse(configString);
  } catch {
    return null;
  }
};
