import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export interface TrendDataPoint {
  name: string;
  fullTitle: string;
  date: string;
  overall: number;
  uniqueness: number;
  market: number;
  competition: number;
}

interface ScoreTrendChartProps {
  data: TrendDataPoint[];
}


const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as TrendDataPoint;
  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
      <p className="text-sm font-semibold text-white mb-1">{point.fullTitle}</p>
      <p className="text-xs text-gray-400 mb-2">{point.date}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span style={{ color: entry.color }} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-gray-200">{entry.value ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LINES = [
  { key: 'overall', name: 'Overall', color: '#34d399', width: 3 },
  { key: 'uniqueness', name: 'Uniqueness', color: '#60a5fa', width: 2 },
  { key: 'market', name: 'Market Viability', color: '#a78bfa', width: 2 },
  { key: 'competition', name: 'Competition', color: '#fbbf24', width: 2 },
] as const;

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ data }) => {
  if (data.length < 2) return null;

  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            interval={0}
            angle={data.length > 6 ? -35 : 0}
            textAnchor={data.length > 6 ? 'end' : 'middle'}
            height={data.length > 6 ? 60 : 30}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-gray-300">{value}</span>
            )}
          />
          {LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.width}
              dot={{ r: 4, fill: line.color, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: line.color, stroke: '#111827', strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;
