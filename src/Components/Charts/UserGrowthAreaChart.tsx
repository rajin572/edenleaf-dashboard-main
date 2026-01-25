import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { IUserGrowthPoint } from "@/types";

interface UserGrowthAreaChartProps {
    data: IUserGrowthPoint[];
    height?: number;
}

const UserGrowthAreaChart = ({ data, height = 220 }: UserGrowthAreaChartProps) => {
    return (
        <div>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                        <linearGradient id="totalUsersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="activeUsersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Area
                        type="monotone"
                        dataKey="totalUsers"
                        name="Total Users"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#totalUsersGrad)"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="activeUsers"
                        name="Active Users"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#activeUsersGrad)"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-6 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-secondbase-color font-medium">
                    <span className="size-2.5 rounded-full bg-[#3b82f6]" />
                    Total Users
                </span>
                <span className="flex items-center gap-1.5 text-xs text-secondbase-color font-medium">
                    <span className="size-2.5 rounded-full bg-[#f59e0b]" />
                    Active Users
                </span>
            </div>
        </div>
    );
};

export default UserGrowthAreaChart;
