export const PRODUCTS_PER_PAGE = 12;

export const PAKISTAN_PROVINCES = [
  "Sindh",
  "Punjab",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
] as const;

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Hyderabad",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Sukkur",
  "Larkana",
  "Nawabshah",
  "Mirpur Khas",
  "Mardan",
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Sahiwal",
] as const;

export const TARGET_AUDIENCES = ["men", "women", "children", "unisex"] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_METHODS = [
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cod", label: "Cash on Delivery" },
] as const;

export const SHIPPING_RATES = {
  standard: 25000, // PKR 250 in paisa
  express: 50000, // PKR 500 in paisa
  freeThreshold: 500000, // Free shipping above PKR 5,000
} as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
