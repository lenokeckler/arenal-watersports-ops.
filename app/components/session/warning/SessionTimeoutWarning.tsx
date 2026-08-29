"use client";

import { useState, useEffect } from "react";
import {
  BUTTON,
  TitleVariant,
  STRING,
  ICON_PATHS,
  ICON_ALTS,
  IMAGE_SIZES,
  SESSION_TIMEOUT_WARNING_MODAL,
} from "@/app/constants";

import Title from "../../title/Title";
import Button from "../../button/Button";
import Icon from "../../icons/icon/Icon";
import Text from "../../text/Text";
import InlineText from "../../text/InlineText";
import { SessionTimeoutWarningProps } from "./SessionTimeoutWarningProps.interface";
import { useSessionData } from "../hooks/useSessionData";

const SessionTimeoutWarning = ({
  isVisible,
  onExtend,
  onLogout,
  remainingSeconds,
}: SessionTimeoutWarningProps) => {
  const {
    title,
    description,
    minute,
    logout,
    keepSession,
  } = useSessionData();

  const [countdown, setCountdown] = useState(
    remainingSeconds
  );

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [isVisible, countdown]);

  useEffect(() => {
    if (countdown === 0) {
      onLogout();
    }
  }, [countdown, onLogout]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/30"
      data-modal={SESSION_TIMEOUT_WARNING_MODAL.ID}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-light-blue">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <Icon
              src={ICON_PATHS.WARNING}
              alt={ICON_ALTS.WARNING}
              size={IMAGE_SIZES.ICON.MEDIUM}
              className="w-6 h-6 text-yellow-600"
            />
          </div>

          <Title
            variant={TitleVariant.AUXILIAR}
            className="text-lg font-medium text-dark-blue mb-2"
          >
            {title}
          </Title>

          <Text className="text-sm text-dark-blue mb-4">
            {description}
            {STRING.SPACE}
            {STRING.SPACE}
            <InlineText className="font-semibold text-red-600">
              {Math.floor(countdown / 60)}:
              {(countdown % 60)
                .toString()
                .padStart(2, STRING.ZERO)}
            </InlineText>
            {STRING.SPACE}
            {minute}
          </Text>

          <div className="flex gap-3">
            <Button
              variant={BUTTON.PRIMARY}
              onClick={onLogout}
              className="
              flex-1 px-4 py-2
              text-sm sm:text-base 
              bg-red-400 text-white rounded 
              border border-red-400
              hover:!bg-red-300
              hover:text-white 
              hover:border-red-300"
            >
              {logout}
            </Button>

            <Button
              variant={BUTTON.SECONDARY}
              onClick={onExtend}
              className="
              flex-1 px-4 py-2
              text-sm sm:text-base 
              bg-sky-blue text-white rounded 
              border border-sky-blue
              hover:!bg-light-blue
              hover:text-white 
              hover:border-light-blue"
            >
              {keepSession}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
