import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { STORE_SLICES } from "@/app/constants";

/**
 * Whether the app drawer (`AppDrawer` — area switch, secondary navigation,
 * profile, logout) is open. Cross-feature by nature: `BottomNav`'s "Menú"
 * item opens it, `AppDrawer` itself reads and closes it — the same shared
 * pattern as `workAreaSlice`.
 */
interface AppDrawerState {
  isOpen: boolean;
}

const initialState: AppDrawerState = {
  isOpen: false,
};

const appDrawerSlice = createSlice({
  name: STORE_SLICES.APP_DRAWER,
  initialState,
  reducers: {
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const appDrawerActions = appDrawerSlice.actions;
export default appDrawerSlice.reducer;
