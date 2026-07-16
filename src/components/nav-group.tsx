import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { SidebarNavGroup } from "@/components/app-shared";
import { ChevronRightIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function NavGroup({ label, items }: SidebarNavGroup) {
	const location = useLocation();

	const isItemActive = (path?: string) => {
		if (!path) return false;
		if (location.pathname === path) return true;
		// Exception for root/base paths that would incorrectly match sub-paths
		if (['/', '/dashboard', '/admin', '/admin/overview'].includes(path)) {
			return location.pathname === path;
		}
		return location.pathname.startsWith(`${path}/`);
	};

	return (
		<SidebarGroup>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<SidebarMenu>
				{items.map((item) => {
					const isActive = isItemActive(item.path) || item.subItems?.some((i) => isItemActive(i.path));
					return (
						<Collapsible className="group/collapsible" defaultOpen={isActive} key={item.title} render={<SidebarMenuItem />}>
							{item.subItems?.length ? (
								<>
									<CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} />}>{item.icon}<span>{item.title}</span><ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /></CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.subItems?.map((subItem) => {
												const isSubActive = isItemActive(subItem.path);
												return (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton isActive={isSubActive} render={<Link to={subItem.path || "#"} />}>{subItem.icon}<span>{subItem.title}</span></SidebarMenuSubButton>
													</SidebarMenuSubItem>
												)
											})}
										</SidebarMenuSub>
									</CollapsibleContent>
								</>
							) : (
								<SidebarMenuButton isActive={isActive} render={<Link to={item.path || "#"} />}>{item.icon}<span>{item.title}</span></SidebarMenuButton>
							)}
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
