"use client";

import { Logo } from "@/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { clientNavGroups, sellerNavGroups, adminNavGroups } from "@/components/app-shared";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOutIcon } from "lucide-react";

export function AppSidebar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const getActiveNavGroups = () => {
		if (user?.role === 'admin') return adminNavGroups;
		if (user?.role === 'seller') return sellerNavGroups;
		return clientNavGroups;
	};
	const activeNavGroups = getActiveNavGroups();

	const getInitials = (name: string) =>
		name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

	const handleLogout = async () => {
		await logout();
		navigate("/auth");
	};

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton render={<Link to="/" />}>
					<Logo className="text-2xl text-white" />
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent>
				{activeNavGroups.map((group, index) => (
					<NavGroup key={`sidebar-group-${index}`} {...group} />
				))}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border">
				<SidebarMenu>
					{/* Profile link */}
					{user && (
						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link to="/profile" />}
								className="h-10"
								tooltip={user.full_name}
							>
								<Avatar className="size-5 flex-shrink-0">
									<AvatarImage src={user.avatar_url ?? undefined} />
									<AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
										{getInitials(user.full_name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start min-w-0">
									<span className="text-xs font-medium truncate">{user.full_name}</span>
									<span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}

					{/* Logout button */}
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={handleLogout}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							tooltip="Se déconnecter"
						>
							<LogOutIcon className="size-4" />
							<span>Se déconnecter</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
