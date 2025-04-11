import { RootState } from "@/store";
import {
  addNutritionFilter,
  clearAllFilters,
  clearNutritionFilters,
  removeNutritionFilter,
  setSortOption,
} from "@/store/slices/filtersSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const FilterSortPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { nutritionFilters, sortBy, sortDirection } = useSelector((state: RootState) => state.filters);

  const [nutrient, setNutrient] = useState("sugars");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const handleAddFilter = () => {
    const filter = {
      nutrient,
      min: minValue ? parseFloat(minValue) : undefined,
      max: maxValue ? parseFloat(maxValue) : undefined,
    };

    dispatch(addNutritionFilter(filter));
    setMinValue("");
    setMaxValue("");
  };

  const handleRemoveFilter = (nutrientName: string) => {
    dispatch(removeNutritionFilter(nutrientName));
  };

  const handleSortChange = (value: string) => {
    if (!value || value === "none") {
      dispatch(
        setSortOption({
          sortBy: "",
          direction: "asc",
        }),
      );
      return;
    }

    const [sortByValue, direction] = value.split("-");
    dispatch(
      setSortOption({
        sortBy: sortByValue,
        direction: direction as "asc" | "desc",
      }),
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter & Sort</h3>

      {/* Sorting Options */}
      <div className="mb-4">
        <Label htmlFor="sort-options">Sort By</Label>
        <Select value={sortBy ? `${sortBy}-${sortDirection}` : ""} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select sorting option</SelectItem>
            <SelectItem value="product_name-asc">Product Name (A-Z)</SelectItem>
            <SelectItem value="product_name-desc">Product Name (Z-A)</SelectItem>
            <SelectItem value="nutrition_grade-asc">Nutrition Grade (Best first)</SelectItem>
            <SelectItem value="nutrition_grade-desc">Nutrition Grade (Worst first)</SelectItem>
            <SelectItem value="energy-asc">Calories (Lowest first)</SelectItem>
            <SelectItem value="energy-desc">Calories (Highest first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nutrition Filters */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Nutrition Filters</h4>

        <div className="flex flex-wrap gap-2 mb-3">
          <Select value={nutrient} onValueChange={setNutrient}>
            <SelectTrigger className="flex-grow">
              <SelectValue placeholder="Select nutrient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sugars">Sugars</SelectItem>
              <SelectItem value="fat">Fat</SelectItem>
              <SelectItem value="salt">Salt</SelectItem>
              <SelectItem value="proteins">Proteins</SelectItem>
              <SelectItem value="energy">Calories</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-20"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="w-20"
            />
          </div>

          <Button onClick={handleAddFilter} size="sm">
            Add Filter
          </Button>
        </div>

        {/* Active Filters */}
        {nutritionFilters.length > 0 && (
          <div className="mt-2">
            <h5 className="text-sm font-medium mb-1">Active Filters:</h5>
            <div className="flex flex-wrap gap-2">
              {nutritionFilters.map((filter) => (
                <div
                  key={filter.nutrient}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                >
                  <span>
                    {filter.nutrient}:{filter.min !== undefined ? ` >${filter.min}` : ""}
                    {filter.max !== undefined ? ` <${filter.max}` : ""}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter(filter.nutrient)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button onClick={() => dispatch(clearNutritionFilters())} size="sm" variant="outline" className="text-xs">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reset All */}
      <Button onClick={() => dispatch(clearAllFilters())} variant="outline" size="sm" className="mt-2">
        Reset All Filters & Sorting
      </Button>
    </div>
  );
};

export default FilterSortPanel;
