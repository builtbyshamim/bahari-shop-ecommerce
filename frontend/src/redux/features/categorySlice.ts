import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoryState {
  primaryCategory: string;
  secondaryCategory: string;
}

const initialState: CategoryState = {
  primaryCategory: "",
  secondaryCategory: "",
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setPrimaryCategory: (state, action: PayloadAction<string>) => {
      state.primaryCategory = action.payload;
    },
    setSecondaryCategory: (state, action: PayloadAction<string>) => {
      state.secondaryCategory = action.payload;
    },
    resetCategories: (state) => {
      state.primaryCategory = "";
      state.secondaryCategory = "";
    },
  },
});

export const { setPrimaryCategory, setSecondaryCategory, resetCategories } =
  categorySlice.actions;

export default categorySlice.reducer;
