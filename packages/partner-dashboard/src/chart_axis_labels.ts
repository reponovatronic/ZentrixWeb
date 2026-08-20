const WEEKDAY_EN_TO_ES_SHORT: Record<string, string> = {
  monday: "LUN",
  mon: "LUN",
  tuesday: "MAR",
  tue: "MAR",
  wednesday: "MIE",
  wed: "MIE",
  thursday: "JUE",
  thu: "JUE",
  friday: "VIE",
  fri: "VIE",
  saturday: "SAB",
  sat: "SAB",
  sunday: "DOM",
  sun: "DOM",
};

/** Etiqueta corta en español para el eje X del gráfico de ventas. */
export function formatChartDayLabel(day: string, isoDate?: string): string {
  const iso = isoDate?.trim();
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const d = new Date(`${iso}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d
        .toLocaleDateString("es-PE", { weekday: "short" })
        .replace(/\./g, "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .slice(0, 3);
    }
  }

  const key = day.trim().toLowerCase();
  if (WEEKDAY_EN_TO_ES_SHORT[key]) return WEEKDAY_EN_TO_ES_SHORT[key];

  const upper = day.trim().toUpperCase().replace(/[ÁÀÄ]/g, "A").replace(/É/g, "E").replace(/Í/g, "I").replace(/Ó/g, "O").replace(/Ú/g, "U");
  if (/^[A-Z]{2,4}$/.test(upper)) return upper.slice(0, 3);

  return day.trim();
}
