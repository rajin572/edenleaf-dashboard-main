import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Define the structure of the chart data
interface ChartData {
  month: string;
  totalUsers: number;
}

const data: ChartData[] = [
  { month: "Jan", totalUsers: 4000 },
  { month: "Feb", totalUsers: 3000 },
  { month: "Mar", totalUsers: 2000 },
  { month: "Apr", totalUsers: 2780 },
  { month: "May", totalUsers: 1890 },
  { month: "Jun", totalUsers: 2390 },
  { month: "Jul", totalUsers: 3490 },
  { month: "Aug", totalUsers: 3490 },
  { month: "Sep", totalUsers: 3490 },
  { month: "Oct", totalUsers: 3490 },
  { month: "Nov", totalUsers: 3490 },
  { month: "Dec", totalUsers: 3490 },
]

const activeDotStyle = {
  r: 8, // Size of the hover dot
  stroke: "#fff", // Color of the hover dot
  strokeWidth: 2, // Border width of the hover dot
  fill: "#0A1A2F", // Inside color of the hover dot
};

const Area_Chart = () => {
  // Formatter function to add 'K' suffix to Y-axis values

  // Custom tick style
  const tickStyle = { fill: "#000", fontSize: 12 };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#E5E5EF"
            strokeDasharray="0"
          />
          <XAxis dataKey="month" tick={{ ...tickStyle }} tickMargin={6} />
          <YAxis
            tickCount={5}
            tick={{ ...tickStyle }}
            tickMargin={16}
            axisLine={{
              stroke: "#ffffff",
              strokeWidth: 2,
              strokeDasharray: "7 7",
            }}
          />

          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A1A2F" stopOpacity={1} />
              <stop offset="70%" stopColor="#fff" stopOpacity={1} />
              <stop offset="100%" stopColor="#fff" stopOpacity={1} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff", // Tooltip background color
              border: "1px solid #ccc", // Tooltip border
              borderRadius: "5px", // Tooltip border radius
            }}
            itemStyle={{ color: "#0a0a08" }} // Tooltip text color
            labelStyle={{ color: "#202020" }} // Tooltip label color
            formatter={(value: number): [string, string] => [
              `${value}`,
              "totalUsers",
            ]}
            labelFormatter={(label: string) => `Month: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="totalUsers"
            stroke="#0A1A2F"
            strokeWidth={3}
            fill="url(#colorUv)"
            activeDot={{ ...activeDotStyle }} // Custom hover line
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Area_Chart;
