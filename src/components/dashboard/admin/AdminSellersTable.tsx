import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { StoreIcon } from "lucide-react";

interface AdminSellersTableProps {
  topSellers: any[];
}

// In a real app we would pass seller_requests from the hook, 
// but we'll mock the UI structure for now or fetch it if needed.
// For the sake of this component, we can display top sellers
export function AdminSellersTable({ topSellers: _topSellers }: AdminSellersTableProps) {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <DashboardSectionHeader
          title="Demandes Vendeurs"
          description="Demandes d'inscription en attente"
        />
      </CardHeader>
      <CardContent>
        {/* We would map through seller requests here. Using placeholder for now */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
            <StoreIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune demande en attente
            </p>
          </div>
          
          {/* Example of how a request would look:
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Boutique Fatou</p>
              <p className="text-xs text-muted-foreground">fatou@example.com</p>
            </div>
            <div className="flex space-x-1">
              <Button size="icon" variant="outline" className="h-8 w-8 text-green-600">
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 text-red-600">
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          */}
        </div>
      </CardContent>
    </Card>
  );
}
