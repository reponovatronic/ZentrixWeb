/** Tipo de notificación (mapea al icono y estilos en UI). */
export type PartnerNotificationKind = "order" | "stock" | "achievement";

export type PartnerNotification = {
  id: string;
  kind: PartnerNotificationKind;
  title: string;
  /** Texto relativo o fecha formateada (ej. «Hace 5 min», «21 Feb, 18:00 PM»). */
  timeLabel: string;
  description: string;
  isRead: boolean;
  /** ISO para ordenar / futuro API. */
  createdAt: string;
};
