import { Language } from "@/app/types";

//TODO: Add interfaces for the data being fetched to ensure type safety and better code readability.
export interface RemoteConfigContextValue {
  // TODO: Define the type of data that will be passed to the children function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | null;
  language: Language;

  setLanguage: (language: Language) => void;
  isLoading: boolean;
}
