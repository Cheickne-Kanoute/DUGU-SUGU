import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShoppingBagIcon, ShoppingCartIcon, StoreIcon, UserCircleIcon, ChevronRightIcon } from "lucide-react";

export function BuyerQuickActions() {
  const actions = [
    {
      title: "Continuer mes achats",
      description: "Parcourir les nouveaux produits.",
      href: "/products",
      icon: <ShoppingBagIcon aria-hidden="true" className="h-6 w-6" />,
      colorClass: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
    },
    {
      title: "Mon panier",
      description: "Finaliser votre commande.",
      href: "/cart",
      icon: <ShoppingCartIcon aria-hidden="true" className="h-6 w-6" />,
      colorClass: "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Devenir Vendeur",
      description: "Faites une demande pour devenir vendeur.",
      href: "/dashboard/become-seller",
      icon: <StoreIcon aria-hidden="true" className="h-6 w-6" />,
      colorClass: "text-purple-600 bg-purple-100 dark:bg-purple-900/30"
    },
    {
      title: "Mon profil",
      description: "Mettre à jour vos informations.",
      href: "/profile",
      icon: <UserCircleIcon aria-hidden="true" className="h-6 w-6" />,
      colorClass: "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
    },
  ];

  return (
    <Card className="col-span-1 lg:col-span-12">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          {actions.map((action, i) => (
            <Link 
              key={i} 
              to={action.href}
              className="flex items-center p-6 hover:bg-muted/30 transition-colors group"
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 mr-4 ${action.colorClass}`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
