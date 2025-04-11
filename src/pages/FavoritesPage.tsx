import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromFavorites } from "@/store/slices/favoritesSlice";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function FavoritesPage() {
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector((state) => state.favorites);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        My Favorite Products
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-muted-foreground">You haven't saved any favorites yet.</p>
          <p className="text-sm mt-2">Browse products and click the heart icon to add them to your favorites.</p>
          <Button asChild className="mt-6">
            <Link to="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground">
            You have {favorites.length} favorite product{favorites.length !== 1 ? "s" : ""}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div
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
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 h-8 w-8 rounded-full"
                    onClick={() => dispatch(removeFromFavorites(product._id))}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/product/${product._id}`} className="hover:underline">
                    <h2 className="font-semibold text-lg line-clamp-2 mb-1">
                      {product.product_name || product.product_name_en || "Unknown Product"}
                    </h2>
                  </Link>
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
              </div>
            ))}
          </div>
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
