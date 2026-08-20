import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useId } from "react";
import { formatChartTooltipAmount } from "./chart_axis_scale";
import {
  resolveMetricsBagDistribution,
  resolveMonthlySalesForChart,
} from "./chart_series";
import {
  buildEmptyMetricsDataset,
  type MetricsRangeId,
} from "./metrics_mock_data";
import { SalesLineChart } from "./sales_line_chart";

const PD_RED = "#e94e51";
const PD_GREEN = "#008236";

export type PartnerMetricsPaneProps = {
  rangeId?: MetricsRangeId;
  /** Solo aplica cuando `rangeId === "custom"` y hay fechas guardadas. */
  customRange?: { from: string; to: string };
  /** Si viene del API, sustituye el dataset mock escalado por periodo. */
  dataset?: MetricsDataset;
  loading?: boolean;
  error?: string | null;
  /** Título del gráfico de ventas (según periodo en la app). */
  salesChartTitle?: string;
  /** Subtítulo del gráfico de ventas. */
  salesChartSubtitle?: string;
};

function TrendIcon({ up }: { up: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {up ? <path d="M12 5l6 8H6l6-8z" fill={PD_GREEN} /> : (
        <path d="M12 19l-6-8h12l-6 8z" fill={PD_GREEN} />
      )}
    </svg>
  );
}

function KpiMiniSpark({ values, up }: { values: number[]; up: boolean }) {
  if (values.length === 0) return null;
  const color = up ? PD_GREEN : PD_RED;
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className="pd-metrics-spark" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={color}
            fillOpacity={0.12}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
}) {
  if (!active || !payload?.length) return null;
  const u = payload[0]?.value;
  if (u == null) return null;
  return (
    <div className="pd-metrics-tooltip pd-metrics-tooltip--dark">
      {u} Uds.
    </div>
  );
}

export function PartnerMetricsPane({
  rangeId = "this_month",
  customRange,
  dataset,
  loading = false,
  error = null,
  salesChartTitle = "Ventas mensuales",
  salesChartSubtitle,
}: PartnerMetricsPaneProps) {
  const uid = useId().replace(/:/g, "");
  const barHi = `pd-mx-bar-hi-${uid}`;
  const barMuted = `pd-mx-bar-muted-${uid}`;

  const emptyFallback = useMemo(
    () => buildEmptyMetricsDataset(rangeId),
    [rangeId]
  );

  const { kpis, monthly, bags, salesSubtitle } = useMemo(() => {
    if (loading || !dataset) {
      return emptyFallback;
    }
    return {
      ...dataset,
      monthly: resolveMonthlySalesForChart(dataset.monthly, false),
      bags: resolveMetricsBagDistribution(dataset.bags, false),
    };
  }, [loading, dataset, emptyFallback]);

  const salesLineData = monthly.map((d) => ({
    label: d.month,
    amountSol: d.amountSol,
  }));

  const barData = bags.map((b) => ({
    ...b,
    name: b.label.replace("\n", " "),
  }));

  const chartSubtitle = salesChartSubtitle?.trim() || salesSubtitle.trim() || "Ingresos (S/)";

  return (
    <div className="pd-metrics">
      {error ? (
        <p className="pd-dashboard-alert" role="alert">
          {error}
        </p>
      ) : null}
      <section className="pd-metrics-kpis" aria-label="Resumen de métricas">
        {kpis.map((k) => (
          <article key={k.title} className="pd-metrics-kpi">
            <div className="pd-metrics-kpi-head">
              <h3 className="pd-metrics-kpi-title">{k.title}</h3>
              <p className="pd-metrics-kpi-value">{loading ? "…" : k.value}</p>
            </div>
            <div className="pd-metrics-kpi-foot">
              <div
                className={
                  k.trendUp ? "pd-metrics-pill pd-metrics-pill--up" : "pd-metrics-pill pd-metrics-pill--down"
                }
              >
                {k.showTrendIcon !== false ? <TrendIcon up={k.trendUp} /> : null}
                <span>{k.trendLabel}</span>
              </div>
              <KpiMiniSpark values={k.spark} up={k.trendUp} />
            </div>
          </article>
        ))}
      </section>

      <section className="pd-metrics-charts" aria-label="Gráficos de métricas">
        <article className="pd-metrics-chart-card pd-metrics-chart-card--wide">
          <header className="pd-metrics-chart-head">
            <h2>{salesChartTitle}</h2>
            <p>{chartSubtitle}</p>
          </header>
          <div className="pd-metrics-line-wrap">
            <SalesLineChart
              data={salesLineData}
              height={280}
              className="pd-chart-canvas pd-chart-canvas--metrics"
            />
          </div>
        </article>

        <article className="pd-metrics-chart-card pd-metrics-chart-card--bars">
          <header className="pd-metrics-chart-head">
            <h2>Tipos de Happy Bag</h2>
            <p>Distribución de ventas</p>
          </header>
          <div className="pd-metrics-bar-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                margin={{ top: 36, right: 8, left: 8, bottom: 4 }}
                barCategoryGap="18%"
              >
                <defs>
                  <linearGradient id={barHi} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f4364c" />
                    <stop offset="45%" stopColor="#ff6b7a" />
                    <stop offset="100%" stopColor="#ffc8ce" />
                  </linearGradient>
                  <linearGradient id={barMuted} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 200, 206, 0.72)" />
                    <stop offset="55%" stopColor="rgba(255, 214, 218, 0.45)" />
                    <stop offset="100%" stopColor="rgba(255, 242, 243, 0.2)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const row = bags.find(
                      (b) => b.label.replace("\n", " ") === payload.value
                    );
                    const lines = row?.label.split("\n") ?? [String(payload.value)];
                    return (
                      <text x={x} y={y} textAnchor="middle" fill="#061d22" fontSize={11}>
                        {lines.map((line, i) => (
                          <tspan key={i} x={x} dy={i === 0 ? 12 : 14}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    );
                  }}
                  axisLine={false}
                  tickLine={false}
                  height={48}
                />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip content={<BarChartTooltip />} cursor={false} />
                <Bar dataKey="units" radius={[12, 12, 0, 0]} maxBarSize={36} isAnimationActive={false}>
                  {barData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.highlight ? `url(#${barHi})` : `url(#${barMuted})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}
