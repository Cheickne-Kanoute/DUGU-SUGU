import type { ReactNode } from "react";
import {
  LayoutGridIcon,
  ShoppingCartIcon,
  FileTextIcon,
  UsersIcon,
  TagIcon,
  ClipboardListIcon,
  PackageIcon,
  LayoutDashboardIcon,
  HeartIcon,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  path?: string;
  icon?: ReactNode;
  isActive?: boolean;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export const sellerNavGroups: SidebarNavGroup[] = [
  {
    label: "Apercu",
    items: [
      {
        title: "Tableau de bord",
        path: "/dashboard",
        icon: <LayoutGridIcon />,
        isActive: true,
      },
      {
        title: "Commandes",
        path: "/dashboard/orders",
        icon: <FileTextIcon />,
      },
    ],
  },
  {
    label: "Magasin",
    items: [
      {
        title: "Produits",
        path: "/dashboard/products",
        icon: <PackageIcon />,
      },
      {
        title: "Gestion du stock",
        path: "/dashboard/stock",
        icon: <ClipboardListIcon />,
      },
    ],
  },
];

export const clientNavGroups: SidebarNavGroup[] = [
  {
    label: "Mon Espace",
    items: [
      {
        title: "Tableau de bord",
        path: "/dashboard",
        icon: <LayoutGridIcon />,
        isActive: true,
      },
      {
        title: "Mon Panier",
        path: "/cart",
        icon: <ShoppingCartIcon />,
      },
      {
        title: "Mes Commandes",
        path: "/dashboard/purchases",
        icon: <FileTextIcon />,
      },
      {
        title: "Mes Favoris",
        path: "/dashboard/favorites",
        icon: <HeartIcon />,
      },
    ],
  },
];

export const footerNavLinks: SidebarNavItem[] = [];

export const adminNavGroups: SidebarNavGroup[] = [
  {
    label: "Tableau de bord",
    items: [
      {
        title: "Vue d'ensemble",
        path: "/admin/overview",
        icon: <LayoutDashboardIcon />,
        isActive: true,
      },
    ],
  },
  {
    label: "Gestion",
    items: [
      {
        title: "Utilisateurs",
        path: "/admin/users",
        icon: <UsersIcon />,
      },
      {
        title: "Categories",
        path: "/admin/categories",
        icon: <TagIcon />,
      },
      {
        title: "Demandes vendeur",
        path: "/admin/seller-requests",
        icon: <ClipboardListIcon />,
      },
    ],
  },
  {
    label: "Catalogue",
    items: [
      {
        title: "Produits",
        path: "/admin/products",
        icon: <PackageIcon />,
      },
      {
        title: "Commandes",
        path: "/admin/orders",
        icon: <FileTextIcon />,
      },
    ],
  },
];

export const navLinks: SidebarNavItem[] = [
  ...sellerNavGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...clientNavGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...adminNavGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
];
