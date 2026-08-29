import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORE_SLICES, type WorkArea } from "@/app/constants";

/**
 * The active work mode (US-ACC-011, section 8 of the access module
 * design). `activeArea` filters which screens the rest of the app shows —
 * it never decides what a request is allowed to do; that stays with the
 * database policies, which do not know this slice exists.
 */
interface WorkAreaState {
  activeArea: WorkArea | null;
  availableAreas: WorkArea[];
}

const initialState: WorkAreaState = {
  activeArea: null,
  availableAreas: [],
};

const workAreaSlice = createSlice({
  name: STORE_SLICES.WORK_AREA,
  initialState,
  reducers: {
    setWorkAreaState: (
      state,
      action: PayloadAction<{
        activeArea: WorkArea | null;
        availableAreas: WorkArea[];
      }>
    ) => {
      state.activeArea = action.payload.activeArea;
      state.availableAreas = action.payload.availableAreas;
    },
    setActiveArea: (state, action: PayloadAction<WorkArea>) => {
      state.activeArea = action.payload;
    },
    resetWorkArea: () => ({ ...initialState }),
  },
});

export const workAreaActions = workAreaSlice.actions;
export default workAreaSlice.reducer;
