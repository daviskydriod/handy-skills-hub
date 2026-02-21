import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const weeklyData = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.2 },
  { day: "Wed", hours: 0.8 },
  { day: "Thu", hours: 3.0 },
  { day: "Fri", hours: 1.8 },
  { day: "Sat", hours: 4.2 },
  { day: "Sun", hours: 2.5 },
];

const courseProgress = [
  { name: "Graphic Design", progress: 78 },
  { name: "Web Design", progress: 45 },
  { name: "Digital Mktg", progress: 92 },
  { name: "Paper Craft", progress: 30 },
];

export default function AnalyticsWidget() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-heading font-semibold text-sm mb-4 text-foreground">Hours Learned This Week</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="hours" stroke="hsl(24 95% 53%)" fill="hsl(24 95% 53% / 0.2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-heading font-semibold text-sm mb-4 text-foreground">Course Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={courseProgress} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}%`, "Progress"]}
            />
            <Bar dataKey="progress" fill="hsl(24 95% 53%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
