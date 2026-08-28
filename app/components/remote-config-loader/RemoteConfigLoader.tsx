import { useRemoteConfig } from "./context";
import React from "react";
import { RemoteConfigLoaderProps } from "./RemoteConfigLoaderProps.interface";

const RemoteConfigLoader = ({
  children,
}: RemoteConfigLoaderProps) => {
  const { data, isLoading } = useRemoteConfig();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return <div>No data available</div>;
  }
  return <>{children(data)}</>;
};

export default RemoteConfigLoader;
