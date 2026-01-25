import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

export interface RevenueChartDataPoint {
    date: string;
    Revenue: number;
}

interface RevenueAreaChartProps {
    data: RevenueChartDataPoint[];
    height?: number;
    color?: string;
    gradientId?: string;
    currencyPrefix?: string;
}

const RevenueAreaChart = ({
    data,
    height = 220,
    color = "#ff5014",
    gradientId = "revenueAreaGrad",
    currencyPrefix = "৳",
}: RevenueAreaChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.04} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${currencyPrefix}${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    formatter={(v) => [`${currencyPrefix}${Number(v).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default RevenueAreaChart;
