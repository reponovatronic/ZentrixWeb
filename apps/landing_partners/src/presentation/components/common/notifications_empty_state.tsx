/** Estado vacío del popover de notificaciones (hasta conectar el API). */
export function NotificationsEmptyState() {
  return (
    <div className="pd-notif-empty-state">
      <img
        className="pd-notif-empty-illustration"
        src="/partners/notify_empty.png"
        alt=""
        width={280}
        height={200}
        decoding="async"
      />
      <h3 className="pd-notif-empty-title">Todo está en calma</h3>
      <p className="pd-notif-empty-desc">
        No tienes notificaciones por ahora. Vuelve más tarde, aquí aparecerán tus
        novedades.
      </p>
    </div>
  );
}
