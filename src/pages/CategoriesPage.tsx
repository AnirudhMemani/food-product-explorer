import FilterSortPanel from "@/components/FilterSortPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { getProductsByCategories } from "@/store/slices/productsSlice";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const POPULAR_CATEGORIES = [
  { id: "en:breakfast-cereals", name: "Breakfast Cereals" },
  { id: "en:dairy", name: "Dairy Products" },
  { id: "en:snacks", name: "Snacks" },
  { id: "en:beverages", name: "Beverages" },
  { id: "en:fruits", name: "Fruits" },
  { id: "en:vegetables", name: "Vegetables" },
  { id: "en:chocolates", name: "Chocolates" },
  { id: "en:breads", name: "Breads" },
  { id: "en:pastas", name: "Pastas" },
  { id: "en:meats", name: "Meats" },
];

export function CategoriesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, selectedCategories, loading, error, totalProducts, currentPage } = useSelector(
    (state: RootState) => state.products,
  );
  const { nutritionFilters, sortBy, sortDirection } = useSelector((state: RootState) => state.filters);
  const [selectedCats, setSelectedCats] = useState<string[]>(selectedCategories || []);
  const [nutritionFilter, setNutritionFilter] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCats(selectedCategories || []);
  }, [selectedCategories]);

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = selectedCats.includes(categoryId)
      ? selectedCats.filter((id) => id !== categoryId)
      : [...selectedCats, categoryId];

    setSelectedCats(updatedCategories);
  };

  const handleApplyFilters = () => {
    if (selectedCats.length > 0) {
      dispatch(getProductsByCategories({ categories: selectedCats }));
    }
  };

  const handleLoadMore = () => {
    if (selectedCategories.length > 0 && !loading) {
      const nextPage = currentPage + 1;
      console.log(`Loading more products: page ${nextPage}`);
      dispatch(getProductsByCategories({ categories: selectedCategories, page: nextPage }));
    }
  };

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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Browse by Categories
        </h1>
      </div>

      <div className="p-6 rounded-lg border bg-gradient-to-r from-indigo-50 to-purple-50 mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Categories</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select multiple categories to see products that match any of them.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {POPULAR_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCats.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label htmlFor={category.id} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleApplyFilters}
            disabled={loading || selectedCats.length === 0}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Results section */}
      {selectedCategories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Results
              <span className="ml-2 text-sm font-normal text-muted-foreground">({totalProducts} products found)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((catId) => {
                const category = POPULAR_CATEGORIES.find((c) => c.id === catId);
                return (
                  <div key={catId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {category?.name || catId.replace("en:", "")}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FilterSortPanel here */}
          {products.length > 0 && <FilterSortPanel />}

          {/* Nutri-Score filter tabs */}
          {products.length > 0 && (
            <Tabs
              defaultValue="all"
              className="w-full mb-4"
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

          {/* Product grid */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">
                {nutritionFilter
                  ? `No products with Nutri-Score ${nutritionFilter.toUpperCase()} found for the selected categories.`
                  : "No products found for the selected categories."}
              </p>
              <p className="text-sm mt-2">Try selecting different categories.</p>
            </div>
          )}

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
        </div>
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

export default CategoriesPage;
