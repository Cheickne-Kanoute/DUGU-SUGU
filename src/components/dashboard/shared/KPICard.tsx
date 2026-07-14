import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

export interface KPICardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'revenue' | 'orders' | 'positive' | 'warning' | 'danger' | 'default';
  delta?: number;
  hint?: string;
  isLoading?: boolean;
  badge?: { text: string; pulse?: boolean };
}

export function KPICard({ label, value, icon, variant = 'default', delta, hint, isLoading, badge }: KPICardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4 mb-1" />
          {hint && <Skeleton className="h-3 w-1/2 mt-2" />}
        </CardContent>
      </Card>
    );
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'revenue': return 'text-[hsl(var(--kpi-revenue))]';
      case 'orders': return 'text-[hsl(var(--kpi-orders))]';
      case 'positive': return 'text-[hsl(var(--kpi-positive))]';
      case 'warning': return 'text-[hsl(var(--kpi-warning))]';
      case 'danger': return 'text-[hsl(var(--kpi-danger))]';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="animate-count-up overflow-hidden relative">
      {badge && (
        <div className={cn(
          "absolute top-0 right-0 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-bl-lg text-white",
          variant === 'danger' ? 'bg-destructive' : 'bg-primary',
          badge.pulse && "animate-pulse-badge"
        )}>
          {badge.text}
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn("h-4 w-4", getVariantStyles())}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {value}
        </div>
      </CardContent>
      {(delta !== undefined || hint) && (
        <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
          {delta !== undefined && (
             <span className={cn(
               "flex items-center font-medium",
               delta > 0 ? "text-emerald-500" : delta < 0 ? "text-destructive" : "text-muted-foreground"
             )}>
               {delta > 0 ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : 
                delta < 0 ? <ArrowDownIcon className="h-3 w-3 mr-0.5" /> : 
                <MinusIcon className="h-3 w-3 mr-0.5" />}
               {Math.abs(delta).toFixed(1)}%
             </span>
          )}
          {hint && <span>{hint}</span>}
        </CardFooter>
      )}
    </Card>
  );
}
