export type DateRange = {
  from: string;
  to: string;
};

export type DateRangePresetId =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_7_days"
  | "custom";

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePresetId, string> = {
  today: "Hoy",
  yesterday: "Ayer",
  this_week: "Esta semana",
  last_week: "Semana pasada",
  this_month: "Este mes",
  last_7_days: "Últimos 7 días",
  custom: "Personalizado",
};

export function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateDisplay(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatRangeDisplay(from: string, to: string): string {
  if (!from || !to) return "Selecciona un periodo";
  return `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function getPresetRange(id: DateRangePresetId): DateRange | null {
  const now = new Date();
  const today = toIsoDateLocal(now);

  switch (id) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = addDays(now, -1);
      const iso = toIsoDateLocal(y);
      return { from: iso, to: iso };
    }
    case "this_week": {
      const mon = startOfWeekMonday(now);
      const sun = addDays(mon, 6);
      return { from: toIsoDateLocal(mon), to: toIsoDateLocal(sun) };
    }
    case "last_week": {
      const thisMon = startOfWeekMonday(now);
      const lastMon = addDays(thisMon, -7);
      const lastSun = addDays(lastMon, 6);
      return { from: toIsoDateLocal(lastMon), to: toIsoDateLocal(lastSun) };
    }
    case "this_month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toIsoDateLocal(first), to: toIsoDateLocal(last) };
    }
    case "last_7_days": {
      const from = addDays(now, -6);
      return { from: toIsoDateLocal(from), to: today };
    }
    case "custom":
      return null;
  }
}

export function defaultDateRange(): DateRange {
  return getPresetRange("this_week") ?? { from: toIsoDateLocal(new Date()), to: toIsoDateLocal(new Date()) };
}

export function normalizeRange(from: string, to: string): DateRange {
  if (!from || !to) return { from, to };
  if (from <= to) return { from, to };
  return { from: to, to: from };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isDateInRange(iso: string, from: string, to: string): boolean {
  if (!from || !to) return false;
  const [a, b] = from <= to ? [from, to] : [to, from];
  return iso >= a && iso <= b;
}
