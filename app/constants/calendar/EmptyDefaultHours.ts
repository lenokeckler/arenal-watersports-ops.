/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock defaultHours interface - replace with actual interface when available
interface DefaultHours {
  monday: any[];
  tuesday: any[];
  wednesday: any[];
  thursday: any[];
  friday: any[];
  saturday: any[];
  sunday: any[];
  excluded_dates?: any[];
  excluded_days?: any[];
  state?: number;
  tourId?: string;
}

const defaultHours: DefaultHours = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
  excluded_dates: [],
  excluded_days: [],
  state: 0,
  tourId: "",
};

export default defaultHours;

export const EMPTY_DEFAULT_HOURS: DefaultHours = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
  excluded_dates: [],
  excluded_days: [],
  state: 0,
  tourId: "",
};
