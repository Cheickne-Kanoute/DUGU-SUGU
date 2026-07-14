import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { PackagePlusIcon, TruckIcon, SettingsIcon, DownloadIcon } from "lucide-react";

export function SellerQuickActions() {
  const actions = [
    {
      title: "Ajouter un produit",
      description: "Creer ou publier un nouvel article.",
      href: "/dashboard/products",
      icon: <PackagePlusIcon aria-hidden="true" className="h-5 w-5" />,
    },
    {
      title: "Mes commandes",
      description: "Voir les commandes en attente et expediees.",
      href: "/dashboard/orders",
      icon: <TruckIcon aria-hidden="true" className="h-5 w-5" />,
    },
    {
      title: "Parametres boutique",
      description: "Consulter vos infos de profil.",
      href: "/profile",
      icon: <SettingsIcon aria-hidden="true" className="h-5 w-5" />,
    },
    {
      title: "Rafraichir les ventes",
      description: "Recharger les indicateurs du dashboard.",
      href: "/dashboard",
      icon: <DownloadIcon aria-hidden="true" className="h-5 w-5" />,
    },
  ];

  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <DashboardSectionHeader
          title="Actions rapides"
          description="Raccourcis vers vos taches frequentes"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className="h-auto w-full justify-start rounded-lg border p-3 hover:border-primary/50 hover:bg-muted/30"
              asChild
            >
              <Link to={action.href} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {action.icon}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
