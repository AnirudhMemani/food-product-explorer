import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { foodProductsApi } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToFavorites, removeFromFavorites } from "@/store/slices/favoritesSlice";
import { Product } from "@/types";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector((state) => state.favorites);

  const isProductFavorite = (productId: string) => {
    return favorites.some((product) => product._id === productId);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await foodProductsApi.getProductById(id);

        if (!response.product || response.status === 0) {
          setError(`Product with barcode ${id} not found. Please check the barcode and try again.`);
          setProduct(null);
        } else {
          setProduct(response.product);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("404")) {
            setError(`Product with barcode ${id} not found. Please check the barcode and try again.`);
          } else {
            setError("Failed to fetch product details. Please try again later.");
          }
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleFavoriteToggle = () => {
    if (!product) return;

    if (isProductFavorite(product._id)) {
      dispatch(removeFromFavorites(product._id));
    } else {
      dispatch(addToFavorites(product));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-[350px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error || "Product not found"}</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const productName = product.product_name || product.product_name_en || "Unknown Product";
  const brandName = product.brands || "Unknown Brand";
  const isFavorite = isProductFavorite(product._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border bg-white p-4 relative">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="icon"
              className={cn(
                "absolute top-4 right-4 h-10 w-10 rounded-full z-10",
                isFavorite ? "bg-red-500 hover:bg-red-600" : "",
              )}
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <img
              src={product.image_url || product.image_front_url || "https://placehold.co/600x400?text=No+Image"}
              alt={productName}
              className="w-full h-auto object-contain max-h-[400px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {product.image_ingredients_url && (
              <div className="border rounded-lg overflow-hidden p-2">
                <img src={product.image_ingredients_url} alt="Ingredients" className="w-full h-auto object-contain" />
                <p className="text-xs text-center mt-1">Ingredients</p>
              </div>
            )}
            {product.image_nutrition_url && (
              <div className="border rounded-lg overflow-hidden p-2">
                <img src={product.image_nutrition_url} alt="Nutrition" className="w-full h-auto object-contain" />
                <p className="text-xs text-center mt-1">Nutrition</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{productName}</h1>
            <p className="text-lg text-muted-foreground">{brandName}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {product.nutriscore_grade && (
                <Badge className={`uppercase font-bold ${getNutriscoreColor(product.nutriscore_grade)}`}>
                  Nutri-Score {product.nutriscore_grade}
                </Badge>
              )}
              {product.ecoscore_grade && (
                <Badge className={`uppercase font-bold ${getEcoscoreColor(product.ecoscore_grade)}`}>
                  Eco-Score {product.ecoscore_grade}
                </Badge>
              )}
              {product.nova_group && (
                <Badge className={`uppercase font-bold ${getNovaGroupColor(product.nova_group)}`}>
                  NOVA Group {product.nova_group}
                </Badge>
              )}
            </div>
          </div>

          <Tabs defaultValue="nutrition" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="nutrition" className="space-y-4">
              {product.nutriments ? (
                <div className="grid grid-cols-2 gap-4">
                  <NutrientCard
                    name="Energy"
                    value={product.nutriments.energy}
                    unit={product.nutriments.energy_unit || "kcal"}
                  />
                  <NutrientCard name="Fat" value={product.nutriments.fat} unit="g" />
                  <NutrientCard name="Saturated Fat" value={product.nutriments.saturated_fat} unit="g" />
                  <NutrientCard name="Carbohydrates" value={product.nutriments.carbohydrates} unit="g" />
                  <NutrientCard name="Sugars" value={product.nutriments.sugars} unit="g" />
                  <NutrientCard name="Fiber" value={product.nutriments.fiber} unit="g" />
                  <NutrientCard name="Proteins" value={product.nutriments.proteins} unit="g" />
                  <NutrientCard name="Salt" value={product.nutriments.salt} unit="g" />
                </div>
              ) : (
                <p className="text-muted-foreground">No nutrition information available.</p>
              )}
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4">
              {product.ingredients_text ? (
                <div className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold mb-2">Ingredients</h3>
                  <p className="text-sm">{product.ingredients_text}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No ingredients information available.</p>
              )}

              {product.allergens_tags && product.allergens_tags.length > 0 && (
                <div className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold mb-2">Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens_tags.map((allergen, index) => (
                      <Badge key={index} variant="destructive">
                        {formatAllergen(allergen)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {product.categories && (
                <div className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <p className="text-sm">{product.categories}</p>
                </div>
              )}

              {product.labels && (
                <div className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold mb-2">Labels</h3>
                  <p className="text-sm">{product.labels}</p>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold mb-2">Product Code</h3>
                <p className="text-sm font-mono">{product.code || product._id}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface NutrientCardProps {
  name: string;
  value: number | undefined;
  unit: string;
}

function NutrientCard({ name, value, unit }: NutrientCardProps) {
  if (value === undefined) return null;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <p className="text-sm text-muted-foreground">{name}</p>
      <p className="text-xl font-semibold">
        {value} {unit}
      </p>
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

function getEcoscoreColor(grade: string): string {
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

function getNovaGroupColor(group: number): string {
  switch (group) {
    case 1:
      return "bg-green-500 text-white";
    case 2:
      return "bg-yellow-500 text-white";
    case 3:
      return "bg-orange-500 text-white";
    case 4:
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function formatAllergen(allergen: string): string {
  return allergen.replace("en:", "").replace(/-/g, " ");
}
