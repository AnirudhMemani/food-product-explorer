import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://world.openfoodfacts.org";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const foodProductsApi = {
  searchProducts: async (query: string, page = 1, pageSize = 24) => {
    try {
      const response = await api.get(
        `/cgi/search.pl?search_terms=${query}&json=true&page=${page}&page_size=${pageSize}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/api/v0/product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  getProductByBarcode: async (barcode: string) => {
    try {
      const response = await api.get(`/api/v0/product/${barcode}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with barcode ${barcode}:`, error);
      throw error;
    }
  },

  getProductByCategory: async (category: string, page = 1) => {
    try {
      const response = await api.get(
        `/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${category}&page=${page}&page_size=24&json=1`,
      );

      return {
        count: response.data.count || 0,
        page: response.data.page || 1,
        page_count: response.data.page_count || 1,
        page_size: response.data.page_size || 24,
        products: response.data.products || [],
      };
    } catch (error) {
      console.error(`Error fetching products with category ${category} (page ${page}):`, error);
      throw error;
    }
  },
};
