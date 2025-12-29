'use client';

import { ColorDistribution as ColorDistributionType } from '@/types/deck';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ColorDistributionProps {
  data: ColorDistributionType;
}

const COLOR_MAP = {
  W: { name: '白', color: '#F0E68C' },
  U: { name: '青', color: '#0E68AB' },
  B: { name: '黒', color: '#150B00' },
  R: { name: '赤', color: '#D3202A' },
  G: { name: '緑', color: '#00733E' },
  C: { name: '無色', color: '#BEB9B2' },
  multicolor: { name: '多色', color: '#F9E084' },
};

export function ColorDistribution({ data }: ColorDistributionProps) {
  const chartData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([color, count]) => ({
      name: COLOR_MAP[color as keyof typeof COLOR_MAP].name,
      value: count,
      color: COLOR_MAP[color as keyof typeof COLOR_MAP].color,
    }));

  if (chartData.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">色分布</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          表示するカードがありません
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">色分布</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
