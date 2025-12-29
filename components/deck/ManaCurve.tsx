'use client';

import { ManaCurveData } from '@/types/deck';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ManaCurveProps {
  data: ManaCurveData[];
}

export function ManaCurve({ data }: ManaCurveProps) {
  // Ensure we have data for CMC 0-7+
  const fullData = Array.from({ length: 8 }, (_, i) => {
    const existing = data.find((d) => d.cmc === i);
    return {
      cmc: i === 7 ? '7+' : i.toString(),
      count: existing?.count || 0,
    };
  });

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">マナカーブ</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={fullData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cmc" label={{ value: '点数で見たマナコスト', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: '枚数', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
