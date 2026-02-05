import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataPoint {
  name?: string;
  value?: number;
  [key: string]: string | number | undefined;
}

interface ReportChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  dataKey?: string;
  color?: string;
  xAxisDataKey?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  multipleDataKeys?: string[];
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export const ReportChart: React.FC<ReportChartProps> = ({
  title,
  data,
  type = 'bar',
  dataKey = 'value',
  color = '#3b82f6',
  xAxisDataKey = 'name',
  height = 300,
  showLegend = true,
  showGrid = true,
  multipleDataKeys = [],
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {type === 'bar' ? (
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {multipleDataKeys.length > 0 ? (
                multipleDataKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))
              ) : (
                <Bar dataKey={dataKey} fill={color} />
              )}
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {multipleDataKeys.length > 0 ? (
                multipleDataKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))
              ) : (
                <Line type="monotone" dataKey={dataKey} stroke={color} />
              )}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={xAxisDataKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
