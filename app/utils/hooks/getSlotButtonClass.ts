import { STRING } from "@/app/constants";

export const getSlotButtonClass = (
  selectedSlot: string | null,
  slotKey: string
) => {
  const baseClasses = [
    "w-full",
    "md:w-28",
    "h-10",
    "flex",
    "items-center",
    "justify-center",
    "border",
    "rounded-xs",
    "text-sm",
    "font-medium",
    "transition-colors",
    "duration-150",
  ];

  if (slotKey === selectedSlot) {
    return [
      ...baseClasses,
      "bg-amber-200",
      "border-amber-500",
      "text-amber-800",
    ].join(STRING.SPACE);
  }

  return [
    ...baseClasses,
    "bg-white",
    "border-green-700",
    "text-green-800",
    "hover:bg-green-50",
  ].join(STRING.SPACE);
};
