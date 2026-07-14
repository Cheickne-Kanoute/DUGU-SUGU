"use client";

import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

interface SellerRevenueChartProps {
  data: { date: string; revenue: number }[];
}

type PeriodDays = 7 | 14 | 30 | 60 | 90;

const chartConfig = {
  revenue: {
    label: "Revenus",
    color: "hsl(var(--kpi-revenue))",
  },
} satisfies ChartConfig;

export function SellerRevenueChart({ data }: SellerRevenueChartProps) {
  const chartUid = useId().replace(/:/g, "");
  const idAreaGradient = `seller-revenue-grad-${chartUid}`;
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30);

  const chartRows = useMemo(() => {
    return data.slice(-periodDays);
  }, [data, periodDays]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card className="col-span-1 lg:col-span-8">
      <CardHeader>
        <DashboardSectionHeader
          title="Mes Revenus"
          description="Évolution de mes ventes"
          action={
            <Select
              value={String(periodDays)}
              onValueChange={(v) => setPeriodDays(Number(v) as PeriodDays)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="14">14 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="60">60 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </CardHeader>
      <CardContent>
        {chartRows.length > 0 ? (
          <ChartContainer className="h-[300px] w-full" config={chartConfig}>
            <AreaChart
              data={chartRows}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={idAreaGradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                width={60}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    labelFormatter={(label) => formatDate(label as string)}
                    formatter={(value) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(value))}
                  />
                } 
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${idAreaGradient})`}
                animationDuration={1000}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
            Pas assez de données pour cette période
          </div>
        )}
      </CardContent>
    </Card>
  );
}
