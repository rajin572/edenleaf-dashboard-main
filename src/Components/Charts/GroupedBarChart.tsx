/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

export interface BarSeries {
    key: string;
    label: string;
    color: string;
}

interface GroupedBarChartProps {
    data: Record<string, any>[];
    xKey: string;
    series: BarSeries[];
    height?: number;
    showLegend?: boolean;
}

const GroupedBarChart = ({ data, xKey, series, height = 220, showLegend = false }: GroupedBarChartProps) => {
    return (
        <div>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#F9FAFB" }} />
                    {series.map((s) => (
                        <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>

            {showLegend && (
                <div className="flex items-center justify-center gap-6 mt-1">
                    {series.map((s) => (
                        <span key={s.key} className="flex items-center gap-1.5 text-xs text-secondbase-color font-medium">
                            <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                            {s.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupedBarChart;
