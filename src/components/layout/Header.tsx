import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/import": "Import Data",
  "/epics": "Epics",
  "/roadmap": "Roadmap",
  "/stories": "User Stories",
  "/generate": "AI Story Generator",
  "/export": "Export",
  "/settings": "Settings",
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "AlphaRisk";

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search epics, stories..."
            className="w-64 pl-9"
          />
        </div>
      </div>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        <span className="sr-only">Notifications</span>
      </Button>
    </header>
  );
}
