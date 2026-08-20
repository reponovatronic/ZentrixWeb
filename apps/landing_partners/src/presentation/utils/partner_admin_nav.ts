/** Admin sin socio enfocado en el dashboard: sólo lista de registrados. */
export const ADMIN_PORTAL_NAV_DIRECTORY_ONLY = ["partners"] as const;

/** Admin tras elegir socio: igual que socio pero sin listado Partners ni Productos (sólo panel, órdenes y métricas). */
export const ADMIN_PORTAL_NAV_IMPERSONATION = ["dashboard", "orders", "metrics"] as const;

/** Vista portal del comercio (rol `partner`): sin ítem «Partners». */
export const BUSINESS_PARTNER_NAV_IDS = [
  "dashboard",
  "orders",
  "products",
  "metrics",
  "profile",
] as const;
