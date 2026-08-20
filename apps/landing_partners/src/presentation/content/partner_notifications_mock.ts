import type { PartnerNotification } from "@/domain/entities/partner_notification";

/** Mock hasta conectar `GET /partners/notifications` (o similar). */
export const MOCK_PARTNER_NOTIFICATIONS: PartnerNotification[] = [
  {
    id: "n1",
    kind: "order",
    title: "Nueva orden recibida",
    timeLabel: "Hace 5 min",
    description:
      "#ORD-2847 · Marco Ríos · 2x Happy Bag Sushi Roll + 1x Happy Bag Miso Soup · S/42.50",
    isRead: false,
    createdAt: "2026-03-08T14:25:00",
  },
  {
    id: "n2",
    kind: "order",
    title: "Nueva orden recibida",
    timeLabel: "Hace 12 min",
    description:
      "#ORD-2846 · Ana Torres · 1x Happy Bag Sorpresa italiana + 1x Happy Bag Postre · S/28.00",
    isRead: false,
    createdAt: "2026-03-08T14:18:00",
  },
  {
    id: "n3",
    kind: "stock",
    title: "Stock bajo: Gyoza",
    timeLabel: "Hace 23 min",
    description: "Solo te queda 1 unidad. Actualiza tu inventario.",
    isRead: false,
    createdAt: "2026-03-08T14:07:00",
  },
  {
    id: "n4",
    kind: "achievement",
    title: "¡Logro desbloqueado!",
    timeLabel: "21 Feb, 18:00 PM",
    description:
      "Completaste 500 órdenes en Happy Bag. Ahora eres Partner Premium.",
    isRead: true,
    createdAt: "2026-02-21T18:00:00",
  },
  {
    id: "n5",
    kind: "order",
    title: "Orden lista para recoger",
    timeLabel: "20 Feb, 13:40 PM",
    description: "#ORD-2791 · Luis Mendoza · 1x Happy Bag Sorpresa · S/18.50",
    isRead: true,
    createdAt: "2026-02-20T13:40:00",
  },
];
