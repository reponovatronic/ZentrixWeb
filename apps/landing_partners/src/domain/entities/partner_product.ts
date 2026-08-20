/** Fila de lista alineada con `PartnerProductListItem` (Flutter). */
export type PartnerProductListRow = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  scheduleLabel: string;
  isActive: boolean;
  offerPriceLabel: string;
  originalPriceLabel: string;
  discountLabel: string;
  stockCount: number;
  categoryApiId: number | null;
};

export type PartnerProductsPageResult = {
  page: number;
  limit: number;
  total: number | null;
  items: PartnerProductListRow[];
};

/** Categorías por defecto (mismo orden que `CreateProductRepositoryImpl` en Flutter). */
export const PARTNER_PRODUCT_CATEGORIES = [
  { id: "sushi", apiCategoryId: 1, label: "Sushi/Japonesa", emoji: "🍣" },
  { id: "pizza", apiCategoryId: 2, label: "Pizza/Italiana", emoji: "🍕" },
  { id: "burger", apiCategoryId: 3, label: "Hamburguesas", emoji: "🍔" },
  { id: "salad", apiCategoryId: 4, label: "Ensaladas", emoji: "🥗" },
  { id: "desserts", apiCategoryId: 5, label: "Postres", emoji: "🍰" },
  { id: "bakery", apiCategoryId: 6, label: "Panadería", emoji: "🥐" },
  { id: "peruvian", apiCategoryId: 7, label: "Peruana", emoji: "🌶️" },
  { id: "other", apiCategoryId: 8, label: "Otra", emoji: "🍽️" },
] as const;

export type PartnerProductCategoryId = (typeof PARTNER_PRODUCT_CATEGORIES)[number]["id"];

export function categoryDraftIdFromApiId(apiId: number | null | undefined): string {
  if (apiId == null) return "";
  const row = PARTNER_PRODUCT_CATEGORIES.find((c) => c.apiCategoryId === apiId);
  return row?.id ?? "";
}

export function categoryApiIdFromDraftId(draftId: string | null | undefined): number | null {
  if (!draftId?.trim()) return null;
  const row = PARTNER_PRODUCT_CATEGORIES.find((c) => c.id === draftId);
  return row?.apiCategoryId ?? null;
}
