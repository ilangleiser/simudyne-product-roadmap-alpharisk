import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/import", icon: Upload, label: "Import Data" },
  { to: "/epics", icon: Layers, label: "Epics" },
  { to: "/roadmap", icon: GitBranch, label: "Roadmap" },
  { to: "/stories", icon: FileText, label: "Stories" },
  { to: "/generate", icon: Sparkles, label: "AI Generate" },
  { to: "/export", icon: Download, label: "Export" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Simudyne</h1>
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

      <div className="border-t border-sidebar-border p-4">
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
