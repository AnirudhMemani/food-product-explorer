import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProductsByCategory } from "@/store/slices/productsSlice";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const dispatch = useAppDispatch();
  const { products, loading, error, totalProducts, currentPage } = useAppSelector((state) => state.products);

  useEffect(() => {
    if (category) {
      dispatch(getProductsByCategory({ category }));
    }
  }, [category, dispatch]);

  const handleLoadMore = () => {
    if (category && !loading) {
      dispatch(getProductsByCategory({ category, page: currentPage + 1 }));
    }
  };

  const formatCategoryName = (categorySlug: string) => {
    return categorySlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        {category ? formatCategoryName(category) : "Category"} Products
      </h1>

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
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{totalProducts} products found</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
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
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}

          {products.length > 0 && products.length < totalProducts && (
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
