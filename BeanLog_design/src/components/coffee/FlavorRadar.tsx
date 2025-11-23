import React from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

interface FlavorRadarProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export const FlavorRadar = ({ data }: FlavorRadarProps) => {
  return (
    <div className="w-full h-[150px] pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#78716c', fontSize: 10 }} 
          />
          <Radar
            name="Flavor"
            dataKey="A"
            stroke="#d97706"
            fill="#d97706"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
