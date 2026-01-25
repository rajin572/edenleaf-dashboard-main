import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ITopSellingProduct } from "@/types";

interface TopProductsBarChartProps {
    data: ITopSellingProduct[];
    height?: number;
    color?: string;
}

const TopProductsBarChart = ({ data, height = 260, color = "#ff5014" }: TopProductsBarChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                />
                <Tooltip
                    formatter={(value: number) => [`${value} units`, "Sold"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="unitsSold" fill={color} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopProductsBarChart;
