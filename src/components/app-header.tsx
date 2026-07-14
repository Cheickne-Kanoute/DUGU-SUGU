"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";

import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const activeItem = navLinks.find((item) => item.isActive);

export function AppHeader() {
  const { user } = useAuth();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'seller': return 'Vendeur';
      case 'client': return 'Client';
      default: return 'Visiteur';
    }
  };

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'seller': return 'default';
      case 'client': return 'secondary';
      default: return 'outline';
    }
  };

	return (
		<header
			className={cn(
				"px-4 mb-6 flex items-center justify-between gap-2 md:px-2"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
        {user && (
          <Badge variant={getRoleVariant(user.role)} className="hidden md:inline-flex ml-2">
            {getRoleLabel(user.role)}
          </Badge>
        )}
			</div>

		</header>
	);
}
