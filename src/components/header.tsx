"use client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { ShoppingCartIcon } from "lucide-react";

export const navLinks = [
	{
		label: "Produits",
		href: "/products",
	},
	{
		label: "Vendeurs",
		href: "/sellers",
	},
	{
		label: "À propos",
		href: "/about",
	},
];

import { useAuth } from "@/context/AuthContext";

export function Header() {
	const scrolled = useScroll(10);
	const { isAuthenticated, user, logout } = useAuth();

	return (
		<header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
				{
					"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
					{
						"md:px-2": scrolled,
					}
				)}
			>
				<a
					className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
					href="/"
				>
					<Logo className="h-4" />
				</a>
				<div className="hidden items-center gap-2 md:flex">
					<div className="flex items-center gap-1">
						{navLinks.map((link) => (
							<Button
								key={link.label}
								size="sm"
								variant="ghost"
								className="rounded-full px-3 text-muted-foreground hover:bg-primary/5 hover:text-primary"
								asChild
							>
								<a href={link.href}>{link.label}</a>
							</Button>
						))}
					</div>
					<div className="flex items-center gap-2 pl-2">
						<Button
							size="icon-sm"
							variant="outline"
							className="h-9 w-9 rounded-full border-primary/20 bg-background text-primary shadow-sm transition-colors hover:bg-primary/5"
							asChild
						>
							<a href="/cart" aria-label="Panier">
								<ShoppingCartIcon className="size-4" />
							</a>
						</Button>
						{isAuthenticated ? (
							<>
								<Button
									size="sm"
									variant="outline"
									className="h-9 rounded-full border-primary/20 bg-background px-4 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/5"
									asChild
								>
									<a href={user?.role === 'admin' ? "/admin/overview" : "/dashboard"}>Tableau de bord</a>
								</Button>
								<Button
									size="sm"
									className="h-9 rounded-full px-4 text-sm font-medium shadow-sm transition-colors bg-red-600 text-white hover:bg-red-700 hover:text-white"
									onClick={() => logout()}
								>
									Déconnexion
								</Button>
							</>
						) : (
							<>
								<Button
									size="sm"
									variant="outline"
									className="h-9 rounded-full border-primary/20 bg-background px-4 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/5"
									asChild
								>
									<a href="/login">Se connecter</a>
								</Button>
								<Button
									size="sm"
									className="h-9 rounded-full px-4 text-sm font-medium shadow-sm transition-colors"
									asChild
								>
									<a href="/register">Créer un compte</a>
								</Button>
							</>
						)}
					</div>
				</div>
				<MobileNav />
			</nav>
		</header>
	);
}
