export interface Product {
  _id: string;
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_url?: string;
  image_small_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  image_ingredients_url?: string;
  image_nutrition_url?: string;
  categories?: string;
  categories_tags?: string[];
  labels?: string;
  labels_tags?: string[];
  nutriments?: {
    energy?: number;
    energy_unit?: string;
    fat?: number;
    fat_unit?: string;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    fiber?: number;
    proteins?: number;
    salt?: number;
    [key: string]: any;
  };
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  allergens_tags?: string[];
  [key: string]: any;
}

export interface SearchResponse {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: Product[];
}

export interface ProductResponse {
  code: string;
  product: Product;
  status: number;
  status_verbose: string;
}

export interface CategoryResponse {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: Product[];
}
