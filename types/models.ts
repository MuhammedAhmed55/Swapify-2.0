// models.ts

export type RedemptionType = "manual" | "stripe";
export type ProductStatus = "pending" | "approved" | "rejected";
export type SwapStatus = "pending" | "accepted" | "rejected";

// 2. Products
export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tags?: string;
  redemption_type: RedemptionType;
  status: ProductStatus;
  product_link?: string;
  created_at: string;
  updated_at: string;
}

// 3. Swaps
export interface Swap {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  status: SwapStatus;
  created_at: string;
  updated_at: string;
}

// 4. Shoutouts (Reviews)
export interface Shoutout {
  id: string;
  user_id: string;
  product_id: string;
  content: string;
  rating: number; // 1 to 5
  created_at: string;
  updated_at: string;
}

// 5. Notifications
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read_status: boolean;
  created_at: string;
  updated_at: string;
}

// 6. Codes
export interface Code {
  id: string;
  product_id: string;
  code: string;
  redemption_type: RedemptionType;
  is_used: boolean;
  created_at: string;
  updated_at: string;
}

// 7. Categories
export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// 8. Product-Categories (Join Table)
export interface ProductCategory {
  product_id: string;
  category_id: string;
}

// 9. Swap Limits
export interface SwapLimit {
  user_id: string;
  total_swaps: number;
  used_swaps: number;
  earned_swaps: number;
  created_at: string;
  updated_at: string;
}
