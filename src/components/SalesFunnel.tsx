"use client";

import { Funnel, FunnelChart, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";

type FunnelData = {
  name: string;
  value: number;
  fill: string;
};

export default function SalesFunnel({ data }: { data: FunnelData[] }) {
  // We sort data descending to ensure a proper funnel shape renders correctly.
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div style={{ width: "100%", height: 350 }}>
      {data.length === 0 ? (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No opportunities trackable yet. Add a client opportunity to see the pipeline!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={sortedData}
              isAnimationActive
            >
              <LabelList position="right" fill="var(--text-primary)" stroke="none" dataKey="name" />
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
