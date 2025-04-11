import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NutritionFilter {
  nutrient: string;
  min?: number;
  max?: number;
}

interface FiltersState {
  nutritionFilters: NutritionFilter[];
  sortBy: string | null;
  sortDirection: "asc" | "desc";
}

const initialState: FiltersState = {
  nutritionFilters: [],
  sortBy: null,
  sortDirection: "asc",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    addNutritionFilter: (state, action: PayloadAction<NutritionFilter>) => {
      const index = state.nutritionFilters.findIndex((filter) => filter.nutrient === action.payload.nutrient);

      if (index >= 0) {
        state.nutritionFilters[index] = action.payload;
      } else {
        state.nutritionFilters.push(action.payload);
      }
    },
    removeNutritionFilter: (state, action: PayloadAction<string>) => {
      state.nutritionFilters = state.nutritionFilters.filter((filter) => filter.nutrient !== action.payload);
    },
    clearNutritionFilters: (state) => {
      state.nutritionFilters = [];
    },
    setSortOption: (state, action: PayloadAction<{ sortBy: string; direction: "asc" | "desc" }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.direction;
    },
    clearAllFilters: (state) => {
      state.nutritionFilters = [];
      state.sortBy = null;
      state.sortDirection = "asc";
    },
  },
});

export const { addNutritionFilter, removeNutritionFilter, clearNutritionFilters, setSortOption, clearAllFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
