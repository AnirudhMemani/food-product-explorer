import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { foodProductsApi } from "@/services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function BarcodePage() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isValidBarcode = (code: string): boolean => {
    const validLengths = [8, 12, 13, 14];

    const isNumeric = /^\d+$/.test(code);

    const hasValidLength = validLengths.includes(code.length);

    return isNumeric && hasValidLength;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedBarcode = barcode.trim();

    if (!trimmedBarcode) {
      setError("Please enter a barcode");
      return;
    }

    if (!isValidBarcode(trimmedBarcode)) {
      setError("Invalid barcode format. Barcodes should be 8, 12, 13, or 14 digits long and contain only numbers.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await foodProductsApi.getProductByBarcode(trimmedBarcode);
      if (response.product) {
        navigate(`/product/${response.product._id}`);
      } else {
        setError("Product not found for this barcode");
      }
    } catch (err) {
      setError("Failed to find product. Please check the barcode and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Barcode Search
      </h1>

      <div className="p-6 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-xl font-semibold mb-4">Find Product by Barcode</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="barcode" className="text-sm font-medium">
              Enter Barcode Number
            </label>
            <Input
              id="barcode"
              type="text"
              placeholder="e.g., 3088543506255"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !barcode.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Enter the barcode number found on the product packaging.</p>
          <p className="mt-1">Example barcodes: 3088543506255, 0737628064502</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-6 rounded-lg border bg-white mt-6">
        <h3 className="font-semibold mb-3">How to find a barcode?</h3>
        <p className="text-sm text-muted-foreground">
          Barcodes are typically located on the back or bottom of product packaging. They consist of a series of
          parallel lines and a 12 or 13-digit number underneath.
        </p>
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Common barcode formats:</h4>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>EAN-13: Used worldwide (13 digits)</li>
            <li>UPC-A: Common in the US (12 digits)</li>
            <li>EAN-8: Used for smaller packaging (8 digits)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
