/** Resumen del panel (`GET /partners/dashboard`). */
export type PartnerDashboardOrder = {
  orderId: number;
  orderCode: string;
  userName: string;
  status: string;
  total: number;
  createdAt: string;
  remainingSeconds: number;
};

export type PartnerDashboard = {
  todayOrders: number;
  todayIncome: number;
  paidOrders: number;
  preparingOrders: number;
  readyOrders: number;
  orders: PartnerDashboardOrder[];
};
