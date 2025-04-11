import { useAppSelector } from "@/store/hooks";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function Header() {
  const { favorites } = useAppSelector((state) => state.favorites);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Logo
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          <Link to="/categories" className="text-sm font-medium hover:underline">
            Categories
          </Link>
          <Link to="/favorites" className="text-sm font-medium hover:underline flex items-center gap-1">
            <Heart className={`h-4 w-4 ${favorites.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link to="/barcode">
            <Button variant="outline" size="sm">
              Barcode Search
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
