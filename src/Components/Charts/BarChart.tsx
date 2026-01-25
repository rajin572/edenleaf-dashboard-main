import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

// Define the structure of each data point in the chart
interface ChartData {
  month: string;
  totalEarnings: number;
}

const data: ChartData[] = [
  { month: "Jan", totalEarnings: 4000 },
  { month: "Feb", totalEarnings: 3000 },
  { month: "Mar", totalEarnings: 2000 },
  { month: "Apr", totalEarnings: 2780 },
  { month: "May", totalEarnings: 1890 },
  { month: "Jun", totalEarnings: 2390 },
  { month: "Jul", totalEarnings: 3490 },
  { month: "Aug", totalEarnings: 3490 },
  { month: "Sep", totalEarnings: 3490 },
  { month: "Oct", totalEarnings: 3490 },
  { month: "Nov", totalEarnings: 3490 },
  { month: "Dec", totalEarnings: 3490 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartData; totalEarnings: number }[];
}

const Bar_Chart = () => {
  // Custom tooltip to display the information
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-md p-2 rounded-md border border-gray-300">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].payload.month}
          </p>
          <p className="text-xs text-gray-600">
            Total Income:{" "}
            <span className="font-semibold">
              ${payload[0].payload.totalEarnings}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tick style for X and Y axes
  const tickStyle = { fill: "#000", fontSize: 12 };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 0,
          }}
          barCategoryGap={30} // Adjust the gap between bars if necessary
        >
          <RechartsTooltip content={<CustomTooltip />} />
          <XAxis dataKey="month" tick={{ ...tickStyle }} tickMargin={6} />
          <YAxis
            tick={{ ...tickStyle }}
            axisLine={{
              stroke: "#0861C500", // Y-axis line color
              strokeWidth: 2,
              strokeDasharray: "7 7",
            }}
            tickMargin={16}
          />

          <Bar
            dataKey="totalEarnings"
            fill="url(#incomeGradient)" // Bar color
            barSize={30} // Width of each bar
            radius={[5, 5, 5, 5]} // Rounded corners for bars
          />

          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0A1A2F" />
              <stop offset="100%" stopColor="#0A1A2F " />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Bar_Chart;
