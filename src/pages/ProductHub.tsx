import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, Product } from "@/types/product";
import { Epic } from "@/types/epic";
import { TrendingUp, Activity, ArrowRight, Sparkles, Layers } from "lucide-react";

const STORAGE_PREFIX = "simudyne-epics-";

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

interface ProductStats {
  epicCount: number;
  storyCount: number;
  quarters: string[];
}

export default function ProductHub() {
  const navigate = useNavigate();
  const [productStats, setProductStats] = useState<Record<string, ProductStats>>({});

  useEffect(() => {
    // Load stats for each product from localStorage
    const stats: Record<string, ProductStats> = {};
    
    PRODUCTS.forEach((product) => {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${product.id}`);
        if (stored) {
          const epics: Epic[] = JSON.parse(stored);
          const quarters = [...new Set(epics.map((e) => e.quarter))];
          stats[product.id] = {
            epicCount: epics.length,
            storyCount: epics.reduce((acc, e) => acc + e.stories.length, 0),
            quarters,
          };
        } else {
          stats[product.id] = { epicCount: 0, storyCount: 0, quarters: [] };
        }
      } catch {
        stats[product.id] = { epicCount: 0, storyCount: 0, quarters: [] };
      }
    });

    setProductStats(stats);
  }, []);

  const handleEnterProduct = (productId: string) => {
    navigate(`/${productId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Simudyne Product Roadmap</h1>
              <p className="text-muted-foreground">
                Select a product to manage its roadmap, epics, and user stories
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Product Cards */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {PRODUCTS.map((product) => {
            const IconComponent = getProductIcon(product.icon);
            const stats = productStats[product.id] || { epicCount: 0, storyCount: 0, quarters: [] };
            
            return (
              <Card
                key={product.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    {stats.epicCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {stats.quarters.join("-") || "No data"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{product.name}</CardTitle>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Sub-products */}
                  <div className="flex flex-wrap gap-2">
                    {product.subProducts.map((subProduct) => (
                      <Badge key={subProduct} variant="outline">
                        {subProduct}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{stats.epicCount}</span>
                      <span className="text-muted-foreground">epics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.storyCount}</span>
                      <span className="text-muted-foreground">stories</span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <Button
                    onClick={() => handleEnterProduct(product.id)}
                    className="w-full group-hover:bg-primary"
                    size="lg"
                  >
                    Enter Product
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
