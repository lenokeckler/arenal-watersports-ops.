"use client";

import React from "react";
import Toast from "./Toast";
import { useToast } from "./utils/useToast";

const ToastContainer = () => {
  const { toasts, isMobile, handleRemoveToast } =
    useToast();

  return (
    <div
      className={`fixed z-50 pointer-events-auto flex flex-col space-y-2
        ${isMobile ? "top-30 left-1/2 transform -translate-x-1/2 items-center" : "top-5 right-5"}`}
    >
      {toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          message={toastItem.message}
          iconPath={toastItem.iconPath}
          onClose={handleRemoveToast(toastItem.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
