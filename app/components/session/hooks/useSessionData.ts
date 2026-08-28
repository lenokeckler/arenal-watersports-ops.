import { useRemoteConfig } from "@/app/components/remote-config-loader/context";
import { SessionData } from "../models/SessionData.interface";

export const useSessionData = (): SessionData => {
  const { data, setLanguage, language } = useRemoteConfig();
  return {
    title:
      data?.subscriptor_module?.logout_inactivity?.title,
    description:
      data?.subscriptor_module?.logout_inactivity
        ?.description,
    minute:
      data?.subscriptor_module?.logout_inactivity?.minute,
    logout:
      data?.subscriptor_module?.logout_inactivity?.logout,
    keep_session:
      data?.subscriptor_module?.logout_inactivity
        ?.keep_session,
    setLanguage,
    language,
  };
};
