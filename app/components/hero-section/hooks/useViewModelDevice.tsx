import { useCheckDeviceWidth } from "@/app/components/check-device-width";

export const useViewModelDevice = () => {
  const { isMobile } = useCheckDeviceWidth();
  return {
    isMobile,
  };
};
