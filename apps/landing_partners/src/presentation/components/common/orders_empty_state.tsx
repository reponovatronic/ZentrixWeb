/** Misma ilustración que notificaciones vacías; copy de órdenes sin pendientes. */
export function OrdersEmptyState() {
  return (
    <div className="pp-orders-empty-state">
      <img
        className="pp-orders-empty-illustration"
        src="/partners/notify_empty.png"
        alt=""
        width={280}
        height={200}
        decoding="async"
      />
      <h3 className="pp-orders-empty-title">Tu zona está tranquila</h3>
      <p className="pp-orders-empty-desc">
        No hay órdenes pendientes por ahora. Vuelve más tarde, pronto podrían
        aparecer nuevas.
      </p>
    </div>
  );
}
