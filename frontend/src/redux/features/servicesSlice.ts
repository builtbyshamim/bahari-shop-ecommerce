import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

interface ServicesState {
  service: Service | null;
}

const initialState: ServicesState = {
  service: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    addServiceInfo(state, action: PayloadAction<Service>) {
      state.service = action.payload;
    },
    removeServiceInfo(state) {
      state.service = null;
    },
  },
});

export const { removeServiceInfo, addServiceInfo } = servicesSlice.actions;
export default servicesSlice.reducer;
