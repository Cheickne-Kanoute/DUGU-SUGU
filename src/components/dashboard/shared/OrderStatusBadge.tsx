import { cn } from "@/lib/utils";

type StatusType = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() as StatusType | string;
  
  let label = status;
  let bgClass = "bg-muted text-muted-foreground";

  switch (normalizedStatus) {
    case 'pending':
      label = 'En attente';
      bgClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      break;
    case 'processing':
      label = 'En traitement';
      bgClass = 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      break;
    case 'shipped':
      label = 'Expédié';
      bgClass = 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
      break;
    case 'delivered':
      label = 'Livré';
      bgClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
      break;
    case 'cancelled':
      label = 'Annulé';
      bgClass = 'bg-red-500/15 text-red-600 dark:text-red-400';
      break;
  }

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", bgClass, className)}>
      {label}
    </span>
  );
}
