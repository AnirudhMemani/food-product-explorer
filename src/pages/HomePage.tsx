import FilterSortPanel from "@/components/FilterSortPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearFilters, searchProducts } from "@/store/slices/productsSlice";
import { debounce } from "@/utils/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function HomePage() {
  const dispatch = useAppDispatch();
  const { products, loading, error, totalProducts, searchQuery, currentPage } = useAppSelector(
    (state) => state.products,
  );
  const [query, setQuery] = useState("");
  const [nutritionFilter, setNutritionFilter] = useState<string | null>(null);

  const { nutritionFilters, sortBy, sortDirection } = useSelector((state: RootState) => state.filters);

  useEffect(() => {
    dispatch(clearFilters());
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.trim()) {
        dispatch(searchProducts({ query: searchTerm }));
      }
    }, 500),
    [dispatch],
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (nutritionFilters.length > 0) {
      filtered = filtered.filter((product) => {
        return nutritionFilters.every((filter) => {
          const nutrientValue = product.nutriments?.[filter.nutrient + "_100g"];
          if (nutrientValue === undefined) return true;

          if (filter.min !== undefined && nutrientValue < filter.min) return false;
          if (filter.max !== undefined && nutrientValue > filter.max) return false;

          return true;
        });
      });
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        let valueA, valueB;

        if (sortBy === "product_name") {
          valueA = a.product_name || "";
          valueB = b.product_name || "";
        } else if (sortBy === "nutrition_grade") {
          valueA = a.nutrition_grades || "z";
          valueB = b.nutrition_grades || "z";
        } else if (sortBy === "energy") {
          valueA = a.nutriments?.["energy-kcal_100g"] || 0;
          valueB = b.nutriments?.["energy-kcal_100g"] || 0;
        } else {
          return 0;
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        } else {
          return sortDirection === "asc"
            ? (valueA as number) - (valueB as number)
            : (valueB as number) - (valueA as number);
        }
      });
    }

    return filtered;
  }, [products, nutritionFilters, sortBy, sortDirection]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);
    debouncedSearch(searchTerm);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchProducts({ query }));
    }
  };

  const handleLoadMore = () => {
    if (searchQuery && !loading) {
      const nextPage = currentPage + 1;
      console.log(`Loading more products: page ${nextPage}`);
      dispatch(searchProducts({ query: searchQuery, page: nextPage }));
    }
  };

  const displayProducts = useMemo(() => {
    const nutriscoreFiltered = nutritionFilter
      ? filteredAndSortedProducts.filter(
          (product) => product.nutriscore_grade?.toLowerCase() === nutritionFilter.toLowerCase(),
        )
      : filteredAndSortedProducts;

    return nutriscoreFiltered;
  }, [filteredAndSortedProducts, nutritionFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search form */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Food Product Explorer
        </h1>

        <div className="p-6 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-semibold mb-4">Search for Food Products</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search for products (e.g., chocolate, pasta, milk)"
              value={query}
              onChange={handleSearchInputChange}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-2">
            Enter a product name, brand, or category to explore food products.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          <p>{error}</p>
        </div>
      )}

      {/* Search results */}
      {searchQuery && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Results for "{searchQuery}"
              <span className="ml-2 text-sm font-normal text-muted-foreground">({totalProducts} products found)</span>
            </h2>
          </div>

          {/* FilterSortPanel here */}
          {products.length > 0 && <FilterSortPanel />}

          {products.length > 0 && (
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={(value) => setNutritionFilter(value === "all" ? null : value)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter by Nutri-Score:</span>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="a" className="bg-green-100">
                    A
                  </TabsTrigger>
                  <TabsTrigger value="b" className="bg-lime-100">
                    B
                  </TabsTrigger>
                  <TabsTrigger value="c" className="bg-yellow-100">
                    C
                  </TabsTrigger>
                  <TabsTrigger value="d" className="bg-orange-100">
                    D
                  </TabsTrigger>
                  <TabsTrigger value="e" className="bg-red-100">
                    E
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          )}
        </div>
      )}

      {/* Home page content when no search */}
      {!searchQuery && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold mb-2">Discover Food Products</h3>
            <p className="text-muted-foreground mb-4">
              Search for your favorite foods to see detailed nutritional information, ingredients, and more.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => dispatch(searchProducts({ query: "chocolate" }))}>
                Chocolate
              </Button>
              <Button variant="outline" onClick={() => dispatch(searchProducts({ query: "pasta" }))}>
                Pasta
              </Button>
              <Button variant="outline" onClick={() => dispatch(searchProducts({ query: "yogurt" }))}>
                Yogurt
              </Button>
            </div>
          </div>
          <div className="p-6 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="text-lg font-semibold mb-2">Browse by Category</h3>
            <p className="text-muted-foreground mb-4">Explore products by food categories or dietary preferences.</p>
            <Link to="/categories">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Browse Categories</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Product grid */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {displayProducts.map((product) => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full"
                >
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={product.image_url || product.image_front_url || "https://placehold.co/400x400?text=No+Image"}
                      alt={product.product_name || product.product_name_en || "Product"}
                      className="object-contain w-full h-full p-2"
                    />
                    {product.nutriscore_grade && (
                      <div className="absolute top-2 right-2">
                        <Badge className={`uppercase font-bold ${getNutriscoreColor(product.nutriscore_grade)}`}>
                          Nutri-Score {product.nutriscore_grade}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-semibold text-lg line-clamp-2 mb-1">
                      {product.product_name || product.product_name_en || "Unknown Product"}
                    </h2>
                    {product.brands && <p className="text-sm text-muted-foreground mb-2">{product.brands}</p>}
                    <div className="mt-auto pt-2 flex flex-wrap gap-1">
                      {product.categories_tags &&
                        product.categories_tags.slice(0, 2).map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {formatCategory(category)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">
                {nutritionFilter
                  ? `No products with Nutri-Score ${nutritionFilter.toUpperCase()} found for "${searchQuery}".`
                  : `No products found for "${searchQuery}".`}
              </p>
              <p className="text-sm mt-2">Try a different search term or check your spelling.</p>
            </div>
          ) : null}

          {/* Load more button */}
          {displayProducts.length > 0 && products.length < totalProducts && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                {loading ? "Loading..." : "Load More Products"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getNutriscoreColor(grade: string): string {
  switch (grade.toLowerCase()) {
    case "a":
      return "bg-green-500 text-white";
    case "b":
      return "bg-lime-500 text-white";
    case "c":
      return "bg-yellow-500 text-white";
    case "d":
      return "bg-orange-500 text-white";
    case "e":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function formatCategory(category: string): string {
  return category.replace("en:", "").replace(/-/g, " ");
}
