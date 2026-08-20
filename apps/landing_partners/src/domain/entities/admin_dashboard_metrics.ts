/** `GET /admin/dashboard/metrics` */
export type AdminMetricsLinePoint = {
  day: string;
  date: string;
  totalIncome: number;
  totalOrders: number;
};

export type AdminMetricsBarPoint = {
  businessTypeId: number;
  businessTypeName: string;
  totalOrders: number;
  percentage: number;
};

export type AdminDashboardMetrics = {
  todayOrders: number;
  todayIncome: number;
  paidOrders: number;
  preparingOrders: number;
  readyOrders: number;
  lineChart: AdminMetricsLinePoint[];
  barChart: AdminMetricsBarPoint[];
};
