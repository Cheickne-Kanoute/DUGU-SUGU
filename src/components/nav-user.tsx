"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, LogOutIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function NavUser() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const getInitials = (name: string) =>
		name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

	const getRoleLabel = (role?: string) => {
		switch (role) {
			case "admin": return "Administrateur";
			case "seller": return "Vendeur";
			case "client": return "Client";
			default: return "";
		}
	};

	const handleLogout = async () => {
		await logout();
		navigate("/auth");
	};

	if (!user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus-visible:outline-none focus-visible:ring-primary/60">
				<Avatar className="size-8 pointer-events-none">
					<AvatarImage src={user.avatar_url ?? undefined} />
					<AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
						{getInitials(user.full_name)}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuItem className="flex items-center justify-start gap-2 pointer-events-none">
					<DropdownMenuLabel className="flex items-center gap-3 p-0">
						<Avatar className="size-10">
							<AvatarImage src={user.avatar_url ?? undefined} />
							<AvatarFallback className="bg-primary/10 text-primary font-semibold">
								{getInitials(user.full_name)}
							</AvatarFallback>
						</Avatar>
						<div>
							<span className="font-medium text-foreground block">{user.full_name}</span>
							<div className="max-w-[160px] overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
								{user.email}
							</div>
							<div className="mt-0.5 text-[10px] text-muted-foreground">
								{getRoleLabel(user.role)}
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
						<UserIcon className="size-4" />
						Mon profil
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						className="w-full cursor-pointer"
						variant="destructive"
						onClick={handleLogout}
					>
						<LogOutIcon className="size-4" />
						Se déconnecter
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
