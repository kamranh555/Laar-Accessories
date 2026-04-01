export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  variantLabel: string | null;
  slug: string;
  maxStock: number;
}
