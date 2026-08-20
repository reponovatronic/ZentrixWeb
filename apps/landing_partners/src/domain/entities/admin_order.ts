/** Fila de `GET /admin/orders`. */
export type AdminOrderListItem = {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerMasked: string;
  customerInitial: string;
  productLabel: string;
  total: number;
  totalDisplay: string;
  status: string;
  statusLabel: string;
  pickupWindow: string;
  createdAt: string;
};

/** Contadores del listado `GET /partners/orders` (o `/admin/orders`). */
export type AdminOrdersPageKpis = {
  pendingPayment: number;
  paid: number;
  preparing: number;
  ready: number;
  delivered: number;
  cancelled: number;
  expired: number;
  total: number;
};

export type AdminOrdersPage = {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  limit: number;
  kpis: AdminOrdersPageKpis | null;
};

export type AdminOrderDetailProduct = {
  id: number;
  name: string;
  price: number;
  priceDisplay: string;
  status: string;
  statusLabel: string;
  storeName: string;
  pickupWindow: string;
  imageUrl: string | null;
};

export type AdminOrderDetail = {
  orderId: number;
  orderCode: string;
  createdAtLabel: string;
  paymentMethod: string;
  status: string;
  statusLabel: string;
  subtotal: number;
  savings: number;
  total: number;
  subtotalDisplay: string;
  savingsDisplay: string;
  totalDisplay: string;
  pickupWindow: string;
  pickupNote: string;
  products: AdminOrderDetailProduct[];
  /** Pasos del stepper según estado actual. */
  progressSteps: Array<{ key: string; label: string; done: boolean; active: boolean }>;
};
