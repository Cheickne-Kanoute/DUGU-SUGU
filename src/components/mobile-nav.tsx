import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/portal";
import { navLinks } from "@/components/header";
import { XIcon, MenuIcon, ShoppingCartIcon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export function MobileNav() {
	const [open, setOpen] = React.useState(false);
	const { isAuthenticated, user, logout } = useAuth();

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? (
					<XIcon className="size-4.5" />
				) : (
					<MenuIcon className="size-4.5" />
				)}
			</Button>
			{open && (
				<Portal className="top-14" id="mobile-menu">
					<PortalBackdrop />
					<div
						className={cn(
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
							"size-full p-4"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="grid gap-y-2">
							{navLinks.map((link) => (
								<Button
									key={link.label}
									className="justify-start rounded-full px-4 text-muted-foreground hover:bg-primary/5 hover:text-primary"
									variant="ghost"
									asChild
								>
									<a href={link.href}>{link.label}</a>
								</Button>
							))}
							<Button
								className="justify-start rounded-full px-4 text-muted-foreground hover:bg-primary/5 hover:text-primary"
								variant="ghost"
								asChild
							>
								<a href="/cart" aria-label="Panier">
									<ShoppingCartIcon className="mr-2 size-4" />
									Panier
								</a>
							</Button>
						</div>
						<div className="mt-12 flex flex-col gap-2">
							{isAuthenticated ? (
								<>
									<Button
										className="h-11 w-full rounded-full border-primary/20 bg-background px-4 text-primary shadow-sm hover:bg-primary/5"
										variant="outline"
										asChild
									>
										<a href={user?.role === 'admin' ? "/admin/overview" : "/dashboard"}>Tableau de bord</a>
									</Button>
									<Button
										className="h-11 w-full rounded-full px-4 shadow-sm bg-red-600 text-white hover:bg-red-700 hover:text-white"
										onClick={() => logout()}
									>
										Déconnexion
									</Button>
								</>
							) : (
								<>
									<Button
										className="h-11 w-full rounded-full border-primary/20 bg-background px-4 text-primary shadow-sm hover:bg-primary/5"
										variant="outline"
										asChild
									>
										<a href="/login">Se connecter</a>
									</Button>
									<Button
										className="h-11 w-full rounded-full px-4 shadow-sm"
										asChild
									>
										<a href="/register">Créer un compte</a>
									</Button>
								</>
							)}
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}
