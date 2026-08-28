export interface RemoteConfigLoaderProps {
  // TODO: Define the type of data that will be passed to the children function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (data: any) => React.ReactNode;
}
