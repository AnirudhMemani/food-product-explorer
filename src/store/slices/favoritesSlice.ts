import { Product } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
  favorites: Product[];
}

const loadFavoritesFromStorage = (): Product[] => {
  if (typeof window === "undefined") return [];

  try {
    const storedFavorites = localStorage.getItem("favorites");
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    console.error("Failed to parse favorites from localStorage:", error);
    return [];
  }
};

const initialState: FavoritesState = {
  favorites: loadFavoritesFromStorage(),
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      if (!state.favorites.some((p) => p._id === product._id)) {
        state.favorites.push(product);
        localStorage.setItem("favorites", JSON.stringify(state.favorites));
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((product) => product._id !== action.payload);
      localStorage.setItem("favorites", JSON.stringify(state.favorites));
    },
  },
});

export const { addToFavorites, removeFromFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
