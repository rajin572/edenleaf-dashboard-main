import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DonutSplitDatum {
    category: string;
    percentage: number;
}

const DEFAULT_COLORS = ["#ff5014", "#3b82f6", "#16a34a", "#d97706", "#dc2626", "#64748B", "#8b5cf6"];

interface DonutSplitChartProps {
    data: DonutSplitDatum[];
    colors?: Record<string, string>;
    height?: number;
}

const DonutSplitChart = ({ data, colors = {}, height = 170 }: DonutSplitChartProps) => {
    const colorFor = (category: string, index: number) => colors[category] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];

    return (
        <div>
            <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="percentage"
                            nameKey="category"
                        >
                            {data.map((entry, index) => (
                                <Cell key={entry.category} fill={colorFor(entry.category, index)} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string) => [`${value}%`, name]}
                            contentStyle={{ borderRadius: 8, fontSize: 12 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                {data.map(({ category, percentage }, index) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: colorFor(category, index) }}
                            />
                            <span className="text-secondbase-color font-medium">{category}</span>
                        </span>
                        <span className="font-bold text-base-color">{percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutSplitChart;
