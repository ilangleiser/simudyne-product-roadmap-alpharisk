import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Database, Download, Info, Home } from "lucide-react";
import { PRODUCTS } from "@/types/product";
import { Epic } from "@/types/epic";

const STORAGE_PREFIX = "simudyne-epics-";

interface ProductStats {
  epicCount: number;
  storyCount: number;
}

export default function SettingsPage() {
  const [productStats, setProductStats] = useState<Record<string, ProductStats>>({});

  useEffect(() => {
    const stats: Record<string, ProductStats> = {};
    PRODUCTS.forEach((product) => {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${product.id}`);
        if (stored) {
          const epics: Epic[] = JSON.parse(stored);
          stats[product.id] = {
            epicCount: epics.length,
            storyCount: epics.reduce((acc, e) => acc + e.stories.length, 0),
          };
        } else {
          stats[product.id] = { epicCount: 0, storyCount: 0 };
        }
      } catch {
        stats[product.id] = { epicCount: 0, storyCount: 0 };
      }
    });
    setProductStats(stats);
  }, []);

  const totalEpics = Object.values(productStats).reduce((acc, s) => acc + s.epicCount, 0);
  const totalStories = Object.values(productStats).reduce((acc, s) => acc + s.storyCount, 0);

  const handleClearAllData = () => {
    PRODUCTS.forEach((product) => {
      localStorage.removeItem(`${STORAGE_PREFIX}${product.id}`);
    });
    setProductStats({});
    toast.success("All data has been cleared");
  };

  const handleExportData = () => {
    const allData: Record<string, Epic[]> = {};
    PRODUCTS.forEach((product) => {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${product.id}`);
        if (stored) {
          allData[product.id] = JSON.parse(stored);
        }
      } catch {
        // Skip
      }
    });

    const data = JSON.stringify({ products: allData, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simudyne-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6 max-w-2xl animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your local data storage across all products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Local Storage</p>
                    <p className="text-sm text-muted-foreground">
                      {totalEpics} epics, {totalStories} stories across {PRODUCTS.length} products
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Backup
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium">Clear All Data</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all epics and stories from all products
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Clear Data</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your epics
                        and user stories from local storage for all products.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAllData}>
                        Yes, clear all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                Simudyne Product Roadmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    This tool helps you transform your product roadmap into detailed, actionable
                    user stories using AI-powered generation.
                  </p>
                  <p>
                    Features include spreadsheet import, AI story generation with agile best
                    practices, dependency visualization, and export to popular PM tools.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
