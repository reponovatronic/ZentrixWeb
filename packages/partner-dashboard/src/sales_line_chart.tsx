import { useId, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  chartHasPositiveValues,
  computeSalesChartYAxis,
  formatChartAxisAmount,
  formatChartTooltipAmount,
} from "./chart_axis_scale";

const PD_RED = "#e94e51";
/** Ancho de la banda vertical (como en el mock Figma). */
const HIGHLIGHT_BAND_STROKE = 48;

export type SalesLinePoint = {
  label: string;
  amountSol: number;
};

type IndexedSalesPoint = SalesLinePoint & { idx: number };

function findPeakIndex(points: IndexedSalesPoint[]): number {
  if (!points.length) return -1;
  let peakIdx = 0;
  let peakVal = points[0]?.amountSol ?? 0;
  points.forEach((p, i) => {
    if (p.amountSol > peakVal) {
      peakVal = p.amountSol;
      peakIdx = i;
    }
  });
  return peakVal > 0 ? peakIdx : -1;
}

function DarkTooltipBubble({ children }: { children: string }) {
  return (
    <div className="pd-chart-tooltip" role="status">
      {children}
      <span className="pd-chart-tooltip-arrow" aria-hidden />
    </div>
  );
}

function SalesHighlightDot(props: {
  cx?: number;
  cy?: number;
  payload?: IndexedSalesPoint;
  peakIdx?: number;
}) {
  const { cx, cy, payload, peakIdx } = props;
  if (cx == null || cy == null || payload?.idx !== peakIdx) {
    return null;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#374151" />
      <foreignObject x={cx - 28} y={cy - 44} width={56} height={32}>
        <div className="pd-chart-tooltip pd-chart-tooltip--on-chart">
          {formatChartTooltipAmount(payload.amountSol)}
          <span className="pd-chart-tooltip-arrow" />
        </div>
      </foreignObject>
    </g>
  );
}

function SalesLineTooltip({
  active,
  payload,
  peakIdx,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: IndexedSalesPoint }>;
  peakIdx?: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const v = row?.value;
  if (v == null) return null;
  if (row.payload?.idx === peakIdx) return null;
  return <DarkTooltipBubble>{formatChartTooltipAmount(v)}</DarkTooltipBubble>;
}

export function pickSalesHighlightLabel(
  points: SalesLinePoint[],
  fallback?: string
): string | undefined {
  if (!points.length) return fallback;
  const peak = points.reduce((best, p) =>
    p.amountSol > best.amountSol ? p : best
  );
  if (peak.amountSol <= 0) return undefined;
  return peak.label;
}

export type SalesLineChartProps = {
  data: SalesLinePoint[];
  height?: number;
  highlightLabel?: string;
  className?: string;
};

/** Gráfico de ventas unificado (estilo mock Figma: gradiente, pico resaltado, banda). */
export function SalesLineChart({
  data,
  height = 220,
  highlightLabel,
  className = "pd-chart-canvas",
}: SalesLineChartProps) {
  const hasValues = chartHasPositiveValues(data.map((d) => d.amountSol));
  const { yTop, ticks: yTicks } = computeSalesChartYAxis(
    data.map((d) => d.amountSol)
  );

  const indexedData: IndexedSalesPoint[] = useMemo(
    () => data.map((point, idx) => ({ ...point, idx })),
    [data]
  );

  const peakIdx = useMemo(() => {
    if (!hasValues) return -1;
    if (highlightLabel?.trim()) {
      const byLabel = indexedData.findIndex(
        (d) => d.label === highlightLabel.trim()
      );
      if (byLabel >= 0 && indexedData[byLabel].amountSol > 0) return byLabel;
    }
    return findPeakIndex(indexedData);
  }, [indexedData, hasValues, highlightLabel]);

  const uid = useId().replace(/:/g, "");
  const lineStroke = `pd-sales-line-${uid}`;
  const xDomain: [number, number] =
    indexedData.length > 0 ? [-0.5, indexedData.length - 0.5] : [0, 1];

  const showBand = hasValues && peakIdx >= 0;

  return (
    <div className={className} aria-hidden>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={indexedData}
          margin={{ top: 32, right: 8, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id={lineStroke} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffc8ce" />
              <stop offset="35%" stopColor="#ff7e8b" />
              <stop offset="55%" stopColor="#f4364c" />
              <stop offset="100%" stopColor="#ffc8ce" />
            </linearGradient>
            <filter
              id={`pd-sales-shadow-${uid}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="4"
                floodColor="#f4364c"
                floodOpacity="0.25"
              />
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="4 6"
            vertical={false}
            stroke="rgba(55, 65, 81, 0.18)"
          />
          <XAxis
            dataKey="idx"
            type="number"
            domain={xDomain}
            ticks={indexedData.map((d) => d.idx)}
            tickFormatter={(idx) => indexedData[idx]?.label ?? ""}
            tick={{ fill: "rgba(27, 39, 72, 0.5)", fontSize: 11, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            width={36}
            domain={[0, yTop]}
            ticks={yTicks}
            tickFormatter={formatChartAxisAmount}
            tick={{ fill: "rgba(27, 39, 72, 0.45)", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<SalesLineTooltip peakIdx={peakIdx} />}
            cursor={false}
          />
          {showBand ? (
            <ReferenceLine
              x={peakIdx}
              stroke={PD_RED}
              strokeOpacity={0.1}
              strokeWidth={HIGHLIGHT_BAND_STROKE}
            />
          ) : null}
          {hasValues ? (
            <Line
              type="monotone"
              dataKey="amountSol"
              stroke={`url(#${lineStroke})`}
              strokeWidth={2.5}
              filter={`url(#pd-sales-shadow-${uid})`}
              dot={<SalesHighlightDot peakIdx={peakIdx} />}
              activeDot={{ r: 5, fill: "#374151", stroke: "none" }}
              isAnimationActive={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
