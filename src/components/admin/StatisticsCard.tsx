import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'text-blue-500',
  subtitle,
  trend,
}) => {
  return (
    <Card className="flex-1">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={`mt-2 text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div
            className={`rounded-lg bg-secondary p-3 ${color}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
