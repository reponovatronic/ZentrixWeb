/** Datos en duro hasta conectar APIs reales. */

export type KpiCard = {
  title: string;
  value: string;
  trendLabel: string;
  trendUp: boolean;
  spark: number[];
};

export type BagTypeBar = {
  label: string;
  percent: number;
  highlight?: boolean;
};

export type OrderRow = {
  id: string;
  customer: string;
  initial: string;
  avatarColor: string;
  product: string;
  total: string;
  status: "Pendiente" | "Confirmada" | "Por recoger" | "Recogida" | "Cancelada";
  pickup: string;
};

export const mockKpis: KpiCard[] = [
  {
    title: "Ventas del día",
    value: "S/486",
    trendLabel: "+ 15%",
    trendUp: true,
    spark: [12, 14, 13, 18, 16, 20, 22],
  },
  {
    title: "Órdenes recibidas",
    value: "20",
    trendLabel: "+ 4 Ud.",
    trendUp: true,
    spark: [8, 9, 8, 10, 11, 12, 14],
  },
  {
    title: "Compra promedio",
    value: "S/20.30",
    trendLabel: "- 3%",
    trendUp: false,
    spark: [22, 21, 20, 19, 20, 18, 17],
  },
  {
    title: "Próximo pago",
    value: "S/1.2K",
    trendLabel: "Vie 04/04",
    trendUp: true,
    spark: [10, 11, 11, 12, 12, 13, 14],
  },
];

/** Día resaltado en el gráfico de ventas semanales del dashboard. */
export const DASHBOARD_WEEKLY_HIGHLIGHT_DAY = "JUE";

/** Etiquetas del eje X del gráfico semanal (estructura estable). */
export const WEEKLY_CHART_DAY_LABELS = [
  "LUN",
  "MAR",
  "MIE",
  "JUE",
  "VIE",
  "SAB",
  "DOM",
] as const;

/** Placeholder visual del gráfico semanal (carga / sin datos del API). */
export const mockWeeklySales: { day: string; amountSol: number }[] = [
  { day: "LUN", amountSol: 420 },
  { day: "MAR", amountSol: 980 },
  { day: "MIE", amountSol: 720 },
  { day: "JUE", amountSol: 1900 },
  { day: "VIE", amountSol: 1680 },
  { day: "SAB", amountSol: 2580 },
  { day: "DOM", amountSol: 2320 },
];

/** @deprecated Usar `mockWeeklySales`. */
export const mockWeeklyLine = mockWeeklySales.map((d) => d.amountSol);

export const mockBagTypes: BagTypeBar[] = [
  { label: "Sorpresa italiana", percent: 40, highlight: true },
  { label: "Caja mixta", percent: 22 },
  { label: "Sorpresa japonesa", percent: 18 },
  { label: "Caja premium", percent: 12 },
  { label: "otros", percent: 8 },
];

export const mockOrders: OrderRow[] = [
  {
    id: "#ORD-2847",
    customer: "Lu*** T***",
    initial: "L",
    avatarColor: "#5b7cfa",
    product: "Sorpresa italiana x3",
    total: "S/36.00",
    status: "Pendiente",
    pickup: "19:00 - 21:00",
  },
  {
    id: "#ORD-2846",
    customer: "Ma*** R***",
    initial: "M",
    avatarColor: "#e94e51",
    product: "Caja mixta x1",
    total: "S/24.00",
    status: "Confirmada",
    pickup: "12:00 - 14:00",
  },
  {
    id: "#ORD-2845",
    customer: "Jo*** P***",
    initial: "J",
    avatarColor: "#22a06b",
    product: "Sorpresa japonesa x2",
    total: "S/48.00",
    status: "Por recoger",
    pickup: "17:00 - 19:00",
  },
  {
    id: "#ORD-2844",
    customer: "An*** S***",
    initial: "A",
    avatarColor: "#9b59b6",
    product: "Caja premium x1",
    total: "S/62.00",
    status: "Recogida",
    pickup: "10:00 - 12:00",
  },
  {
    id: "#ORD-2843",
    customer: "Ca*** M***",
    initial: "C",
    avatarColor: "#f39c12",
    product: "Sorpresa italiana x1",
    total: "S/18.00",
    status: "Pendiente",
    pickup: "14:00 - 16:00",
  },
];

export const mockNav = [
  { id: "dashboard", label: "Dashboard", icon: "grid" as const, active: true },
  { id: "orders", label: "Órdenes", icon: "bag" as const, active: false },
  { id: "products", label: "Productos", icon: "box" as const, active: false },
  { id: "partners", label: "Partners", icon: "partners" as const, active: false },
  { id: "metrics", label: "Métricas", icon: "chart" as const, active: false },
  { id: "profile", label: "Perfil", icon: "user" as const, active: false },
];
