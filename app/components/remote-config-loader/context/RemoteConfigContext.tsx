"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchAllRemoteConfig } from "@/app/services/fetchAllRemoteConfig";
import { RemoteConfigContextValue } from "./models/RemoteConfigContext.interfece";
import { safeObject } from "@/app/utils/safe-value/SafeValue";
import { useLanguage } from "@/app/store";

const LOCAL_STORAGE_KEY = "remoteConfigData";
const LOCAL_STORAGE_TIMESTAMP_KEY =
  "remoteConfigDataTimestamp";
const ONE_DAY_CACHE_DURATION = 24 * 60 * 60 * 1000;
const RemoteConfigContext =
  createContext<RemoteConfigContextValue | null>(null);

/**
 * Context provider component that manages the remote configuration
 * data and provides it to the rest of the application. It fetches the remote configuration
 * data asynchronously and allows consumers to access the data, set the language, and check
 * the loading state.
 *
 * @param {Object} props - The props for the RemoteConfigProvider component.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 *
 * @returns {JSX.Element} A context provider component that wraps its children with the remote configuration context.
 */

//TODO: Add a loading state to the fetchAllRemoteConfig function and show a loading spinner while the data is being fetched.
//TODO: Add interfaces for the data being fetched to ensure type safety and better code readability.
export const RemoteConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // TODO: Define the type of data that will be passed to the children function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fullData, setFullData] = useState<any | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const cachedData = localStorage.getItem(
        LOCAL_STORAGE_KEY
      );
      const cachedTimestamp = localStorage.getItem(
        LOCAL_STORAGE_TIMESTAMP_KEY
      );
      const now = Date.now();
      if (
        cachedData &&
        cachedTimestamp &&
        now - parseInt(cachedTimestamp, 10) <
          ONE_DAY_CACHE_DURATION
      ) {
        // Use cached data
        setFullData(JSON.parse(cachedData));
        setIsLoading(false);
      } else {
        // Fetch from remote config
        const data = await fetchAllRemoteConfig();
        setFullData(data);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(data)
        );
        localStorage.setItem(
          LOCAL_STORAGE_TIMESTAMP_KEY,
          now.toString()
        );
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const value: RemoteConfigContextValue = {
    data: safeObject(fullData?.languages?.[language]),
    language,
    setLanguage,
    isLoading,
  };

  return (
    <RemoteConfigContext.Provider value={value}>
      {children}
    </RemoteConfigContext.Provider>
  );
};

export const useRemoteConfig = () => {
  const context = useContext(RemoteConfigContext);
  if (!context) {
    throw new Error(
      "useRemoteConfig must be used within RemoteConfigProvider"
    );
  }
  return context;
};
