import { useMemo } from "react";
import { useRemoteConfig } from "@/app/components/remote-config-loader/context";

export const usePlanByKey = (planKey: string) => {
  const { data } = useRemoteConfig();

  return useMemo(() => {
    if (!data?.client_module?.plans || !planKey) {
      return null;
    }

    const plan = data.client_module.plans[planKey];
    if (!plan) {
      return null;
    }

    return {
      key: planKey,
      ...plan,
    };
  }, [data, planKey]);
};
