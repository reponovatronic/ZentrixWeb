import { useId } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartTooltipAmount } from "./chart_axis_scale";
import {
  resolveBagTypesForChart,
  resolveWeeklySalesForChart,
  type DashboardWeeklyChartPoint,
} from "./chart_series";
import { SalesLineChart } from "./sales_line_chart";

function DarkTooltipBubble({ children }: { children: string }) {
  return (
    <div className="pd-chart-tooltip" role="status">
      {children}
      <span className="pd-chart-tooltip-arrow" aria-hidden />
    </div>
  );
}

function BarHighlightLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  index?: number;
}) {
  const { x, y, width, value, index } = props;
  if (x == null || y == null || width == null || index !== 0 || value == null) {
    return <g />;
  }
  const cx = x + width / 2;
  return (
    <foreignObject x={cx - 28} y={y - 40} width={56} height={32}>
      <div className="pd-chart-tooltip pd-chart-tooltip--on-chart">
        {value}%
        <span className="pd-chart-tooltip-arrow" />
      </div>
    </foreignObject>
  );
}

export type { DashboardWeeklyChartPoint } from "./chart_series";

export type DashboardWeeklySalesChartProps = {
  data?: DashboardWeeklyChartPoint[];
  loading?: boolean;
  highlightDay?: string;
};

export function DashboardWeeklySalesChart({
  data,
  loading = false,
  highlightDay,
}: DashboardWeeklySalesChartProps = {}) {
  const chartData = resolveWeeklySalesForChart(data, loading);
  const linePoints = chartData.map((d) => ({
    label: d.day,
    amountSol: d.amountSol,
  }));

  return (
    <SalesLineChart
      data={linePoints}
      height={220}
      highlightLabel={highlightDay?.trim()}
    />
  );
}

export type DashboardBagTypesChartProps = {
  data?: Array<{ label: string; percent: number; highlight?: boolean }>;
  loading?: boolean;
};

export function DashboardBagTypesChart({
  data,
  loading = false,
}: DashboardBagTypesChartProps = {}) {
  const uid = useId().replace(/:/g, "");
  const barHi = `pd-dash-bar-hi-${uid}`;
  const barMuted = `pd-dash-bar-muted-${uid}`;

  const source = resolveBagTypesForChart(data, loading);
  const barData = source.map((b) => ({
    ...b,
    name: b.label,
  }));

  return (
    <div className="pd-chart-canvas" aria-hidden>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={barData}
          margin={{ top: 40, right: 4, left: 4, bottom: 0 }}
          barCategoryGap="22%"
        >
          <defs>
            <linearGradient id={barHi} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f4364c" />
              <stop offset="45%" stopColor="#ff6b7a" />
              <stop offset="100%" stopColor="#ffc8ce" />
            </linearGradient>
            <linearGradient id={barMuted} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(255, 107, 122, 0.55)" />
              <stop offset="55%" stopColor="rgba(255, 200, 206, 0.5)" />
              <stop offset="100%" stopColor="rgba(255, 235, 238, 0.35)" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(27, 39, 72, 0.72)", fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            height={56}
          />
          <YAxis hide domain={[0, 50]} />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as { highlight?: boolean; percent: number };
              if (row.highlight) return null;
              return <DarkTooltipBubble>{`${row.percent}%`}</DarkTooltipBubble>;
            }}
          />
          <Bar
            dataKey="percent"
            radius={[99, 99, 99, 99]}
            maxBarSize={34}
            isAnimationActive={false}
            label={BarHighlightLabel}
          >
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
  );
}
