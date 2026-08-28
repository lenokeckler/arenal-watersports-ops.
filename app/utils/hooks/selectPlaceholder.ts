// Mock interface - replace with actual interface when available
interface Slot {
  id: string;
  time: string;
  available: boolean;
}

export const selectPlaceholder = (slot: Slot): string => {
  if (!slot) {
    return "Select a time slot";
  }

  return slot.available ? slot.time : "Slot unavailable";
};
