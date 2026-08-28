import { FC } from "react";
import Button from "../button/Button";
import Title from "../title/Title";
import RemoteConfigLoader from "../remote-config-loader/RemoteConfigLoader";
import Text from "../text/Text";
import {
  BUTTON,
  TitleVariant,
  ARIA_ROLE,
} from "@/app/constants";
import type { ReplacePlanModalProps } from "./ReplacePlanModalProps.interface";

const ReplacePlanModal: FC<ReplacePlanModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }
  return (
    <RemoteConfigLoader>
      {(data) => (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40"
          role={ARIA_ROLE.DIALOG}
          aria-modal={true}
          tabIndex={-1}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <header>
              <Title
                variant={TitleVariant.SECONDARY}
                className="text-dark-blue text-xl font-bold mb-4"
              >
                {
                  data?.client_module?.homepage
                    ?.plans_section?.full_cart_modal?.title
                }
              </Title>
            </header>
            <Text className="mb-6 text-dark-blue">
              {
                data?.client_module?.homepage?.plans_section
                  ?.full_cart_modal?.question
              }
            </Text>
            <footer className="flex justify-center gap-4">
              <Button
                variant={BUTTON.BASE}
                className="w-40 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-dark-blue"
                onClick={onConfirm}
                autoFocus
              >
                {
                  data?.client_module?.homepage
                    ?.plans_section?.full_cart_modal
                    ?.ok_button
                }
              </Button>
              <Button
                variant={BUTTON.BASE}
                className="w-40 px-4 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-900"
                onClick={onCancel}
              >
                {
                  data?.client_module?.homepage
                    ?.plans_section?.full_cart_modal
                    ?.cancel_button
                }
              </Button>
            </footer>
          </div>
        </div>
      )}
    </RemoteConfigLoader>
  );
};

export default ReplacePlanModal;
