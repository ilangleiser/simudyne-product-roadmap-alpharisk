import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Layers,
  GitBranch,
  FileText,
  Download,
  Settings,
  Sparkles,
  Home,
  TrendingUp,
  Activity,
} from "lucide-react";
import { getProductById } from "@/types/product";

const getNavItems = (productId: string) => [
  { to: `/${productId}/dashboard`, icon: LayoutDashboard, label: "Dashboard" },
  { to: `/${productId}/import`, icon: Upload, label: "Import Data" },
  { to: `/${productId}/epics`, icon: Layers, label: "Epics" },
  { to: `/${productId}/roadmap`, icon: GitBranch, label: "Roadmap" },
  { to: `/${productId}/stories`, icon: FileText, label: "Stories" },
  { to: `/${productId}/generate`, icon: Sparkles, label: "AI Generate" },
  { to: `/${productId}/export`, icon: Download, label: "Export" },
];

const getProductIcon = (iconName: string) => {
  switch (iconName) {
    case "TrendingUp":
      return TrendingUp;
    case "Activity":
      return Activity;
    default:
      return Sparkles;
  }
};

export function Sidebar() {
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getProductById(productId) : null;
  const navItems = productId ? getNavItems(productId) : [];
  const ProductIcon = product ? getProductIcon(product.icon) : Sparkles;

  return (
    <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <ProductIcon className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {product?.name || "Simudyne"}
          </h1>
          <p className="text-xs text-sidebar-foreground/70">Product Roadmap</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          Switch Product
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
