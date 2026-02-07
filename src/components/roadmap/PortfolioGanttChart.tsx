import React, { useState, useMemo, useCallback, useRef } from "react";
import { Epic } from "@/types/epic";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GanttTimeline } from "./GanttTimeline";
import { ProductHeaderRow, PortfolioEpicRow } from "./PortfolioGanttRow";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

export interface ProductEpics {
  product: Product;
  epics: Epic[];
}

interface PortfolioGanttChartProps {
  productData: ProductEpics[];
  year: number;
}

const MIN_LABEL_WIDTH = 200;
const MAX_LABEL_WIDTH = 500;
const DEFAULT_LABEL_WIDTH = 280;

export function PortfolioGanttChart({ productData, year }: PortfolioGanttChartProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(productData.map((p) => p.product.id))
  );
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);
  const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_LABEL_WIDTH);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = labelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(MAX_LABEL_WIDTH, Math.max(MIN_LABEL_WIDTH, startWidth.current + delta));
      setLabelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [labelWidth]);

  const toggleProduct = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) {
        next.delete(epicId);
      } else {
        next.add(epicId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedProducts(new Set());
      setExpandedEpics(new Set());
      setAllExpanded(false);
    } else {
      setExpandedProducts(new Set(productData.map((p) => p.product.id)));
      // Optionally expand all epics too
      const allEpicIds = productData.flatMap((p) => p.epics.map((e) => e.id));
      setExpandedEpics(new Set(allEpicIds));
      setAllExpanded(true);
    }
  };

  const totalEpics = useMemo(
    () => productData.reduce((sum, p) => sum + p.epics.length, 0),
    [productData]
  );

  const totalStories = useMemo(
    () => productData.reduce(
      (sum, p) => sum + p.epics.reduce((eSum, e) => eSum + e.stories.length, 0),
      0
    ),
    [productData]
  );

  const completedStories = useMemo(
    () => productData.reduce(
      (sum, p) => sum + p.epics.reduce(
        (eSum, e) => eSum + e.stories.filter((s) => s.status === "Done").length,
        0
      ),
      0
    ),
    [productData]
  );

  const gridCols = `${labelWidth}px 1fr`;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Portfolio Roadmap Overview</CardTitle>
              <CardDescription className="mt-0.5">
                All products across the {year} timeline
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{productData.length} products</Badge>
              <Badge variant="outline">{totalEpics} epics</Badge>
              <Badge variant="outline">{totalStories} stories</Badge>
              <Badge variant="secondary" className="bg-status-done/20 text-status-done">
                {completedStories} done
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="gap-2"
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expand All
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div
              className="grid border-b border-border sticky top-0 bg-background z-20"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="relative px-3 py-2 font-medium text-sm text-muted-foreground border-r border-border bg-muted/30 select-none">
                Product / Epic
                {/* Resize handle */}
                <div
                  className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-30"
                  onMouseDown={handleMouseDown}
                  title="Drag to resize"
                />
              </div>
              <div className="relative">
                <GanttTimeline year={year} />
              </div>
            </div>

            {/* Product Rows */}
            <div className="relative">
              {productData.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No products to display. Add products to see them here.
                </div>
              ) : (
                productData.map(({ product, epics }) => {
                  const isProductExpanded = expandedProducts.has(product.id);
                  const storyCount = epics.reduce((sum, e) => sum + e.stories.length, 0);

                  return (
                    <React.Fragment key={product.id}>
                      {/* Product Header */}
                      <ProductHeaderRow
                        product={product}
                        epicCount={epics.length}
                        storyCount={storyCount}
                        isExpanded={isProductExpanded}
                        onToggle={() => toggleProduct(product.id)}
                        labelWidth={labelWidth}
                      />

                      {/* Epics under this product */}
                      {isProductExpanded && epics.map((epic) => (
                        <PortfolioEpicRow
                          key={epic.id}
                          epic={epic}
                          product={product}
                          year={year}
                          isExpanded={expandedEpics.has(epic.id)}
                          onToggle={() => toggleEpic(epic.id)}
                          labelWidth={labelWidth}
                        />
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Product Legend */}
        <div className="flex items-center justify-center gap-8 py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Products:</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-product-horizon" />
            <span className="text-xs">Horizon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-product-pulse" />
            <span className="text-xs">Pulse_SDG</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-product-alpharisk" />
            <span className="text-xs">AlphaRisk Studio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
