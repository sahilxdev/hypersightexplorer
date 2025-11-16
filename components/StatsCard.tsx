'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
}

export default function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-secondary rounded-md">
          {icon}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">{description}</p>
    </div>
  );
}