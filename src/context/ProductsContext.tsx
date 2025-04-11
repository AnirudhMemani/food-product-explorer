import { foodProductsApi } from "@/services/api";
import { Product } from "@/types";
import { createContext, ReactNode, useContext, useState } from "react";

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  searchQuery: string;
  selectedCategory: string | null;
  searchProducts: (query: string, page?: number) => Promise<void>;
  getProductsByCategory: (category: string, page?: number) => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  clearFilters: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const searchProducts = async (query: string, page = 1) => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedCategory(null);

    try {
      const response = await foodProductsApi.searchProducts(query, page);

      if (page === 1) {
        setProducts(response.products || []);
      } else {
        setProducts((prev) => [...prev, ...(response.products || [])]);
      }

      setTotalProducts(response.count || 0);
      setCurrentPage(page);
      setSearchQuery(query);
    } catch (err) {
      setError("Failed to search products. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = async (category: string, page = 1) => {
    setLoading(true);
    setError(null);
    setSearchQuery("");

    try {
      const response = await foodProductsApi.getProductByCategory(category);

      if (page === 1) {
        setProducts(response.products || []);
      } else {
        setProducts((prev) => [...prev, ...(response.products || [])]);
      }

      setTotalProducts(response.count || 0);
      setCurrentPage(page);
      setSelectedCategory(category);
    } catch (err) {
      setError(`Failed to fetch products in category "${category}". Please try again later.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loading) return;

    if (searchQuery) {
      await searchProducts(searchQuery, currentPage + 1);
    } else if (selectedCategory) {
      await getProductsByCategory(selectedCategory, currentPage + 1);
    }
  };

  const clearFilters = () => {
    setProducts([]);
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1);
    setTotalProducts(0);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        totalProducts,
        currentPage,
        searchQuery,
        selectedCategory,
        searchProducts,
        getProductsByCategory,
        loadMoreProducts,
        clearFilters,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
