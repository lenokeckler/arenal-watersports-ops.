import { ToastProps } from "./models/ToastProps.interface";
import {
  ICON_PATHS,
  ICON_ALTS,
  ARIA_LABEL,
} from "@/app/constants";
import { Icon, Button, Image } from "@/app/components";

export default function Toast({
  message,
  iconPath,
  onClose,
}: ToastProps) {
  return (
    <div className="flex items-center w-full max-w-xs p-4 mb-4 bg-white rounded-lg shadow-sm">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg">
        <Icon
          src={iconPath}
          alt={ICON_ALTS.TOAST_ICON}
          width={30}
          height={30}
          priority
          aria-hidden
          className="ms-2"
        ></Icon>
      </div>
      <div className="ml-3 text-sm lg:text-base font-normal text-black">
        {message}
      </div>
      <Button
        onClick={onClose}
        aria-label={ARIA_LABEL.CLOSE_TOAST}
        className="ml-auto text-gray-400 hover:text-gray-900 bg-transparent border-none"
      >
        <Image
          src={ICON_PATHS.X_MODAL}
          alt={ICON_ALTS.CLOSE_TOAST_ICON}
          width={20}
          height={20}
          aria-hidden
          priority
        />
      </Button>
    </div>
  );
}
