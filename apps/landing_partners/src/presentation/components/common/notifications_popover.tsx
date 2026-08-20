import type {
  PartnerNotification,
  PartnerNotificationKind,
} from "@/domain/entities/partner_notification";
import { NotificationsEmptyState } from "@/presentation/components/common/notifications_empty_state";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import "@/presentation/styles/notifications_popover.css";

const NOTIFICATION_ICON: Record<PartnerNotificationKind, string> = {
  order: "📦",
  stock: "⚠️",
  achievement: "🎉",
};

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function NotificationItem({ item }: { item: PartnerNotification }) {
  return (
    <li>
      <article className="pd-notif-item">
        <span className="pd-notif-icon" aria-hidden>
          {NOTIFICATION_ICON[item.kind]}
        </span>
        <div className="pd-notif-body">
          <div className="pd-notif-row">
            <h4 className="pd-notif-item-title">{item.title}</h4>
            <time className="pd-notif-time" dateTime={item.createdAt}>
              {item.timeLabel}
            </time>
          </div>
          <p className="pd-notif-desc">{item.description}</p>
        </div>
        {!item.isRead ? <span className="pd-notif-unread" aria-label="No leída" /> : null}
      </article>
    </li>
  );
}

export type NotificationsPopoverProps = {
  /** Sustituir por datos del servicio cuando exista el API. */
  notifications?: PartnerNotification[];
};

export function NotificationsPopover({
  notifications = [],
}: NotificationsPopoverProps) {
  const uid = useId().replace(/:/g, "");
  const panelId = `pd-notif-panel-${uid}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { newItems, previousItems } = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      newItems: sorted.filter((n) => !n.isRead),
      previousItems: sorted.filter((n) => n.isRead),
    };
  }, [notifications]);

  const unreadCount = newItems.length;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="pd-notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="pd-icon-btn pd-notif-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={
          unreadCount > 0
            ? `Notificaciones, ${unreadCount} sin leer`
            : "Notificaciones"
        }
        onClick={() => setOpen((o) => !o)}
      >
        <IconBell />
        {unreadCount > 0 ? (
          <span className="pd-notif-badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className="pd-notif-panel"
          role="dialog"
          aria-label="Notificaciones"
        >
          <h2 className="pd-notif-panel-title">Notificaciones</h2>
          <div className="pd-notif-scroll">
            {newItems.length > 0 ? (
              <section
                className="pd-notif-section pd-notif-section--new"
                aria-label={`Nuevas, ${newItems.length}`}
              >
                <h3 className="pd-notif-section-heading">Nuevas ({newItems.length})</h3>
                <ul className="pd-notif-list">
                  {newItems.map((item) => (
                    <NotificationItem key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            ) : null}

            {previousItems.length > 0 ? (
              <section className="pd-notif-section" aria-label="Anteriores">
                <h3 className="pd-notif-section-heading">Anteriores</h3>
                <ul className="pd-notif-list">
                  {previousItems.map((item) => (
                    <NotificationItem key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            ) : null}

            {newItems.length === 0 && previousItems.length === 0 ? (
              <NotificationsEmptyState />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
