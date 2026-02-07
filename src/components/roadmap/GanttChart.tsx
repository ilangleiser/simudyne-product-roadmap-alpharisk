import React, { useState, useMemo, useCallback, useRef } from "react";
import { Epic } from "@/types/epic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GanttTimeline } from "./GanttTimeline";
import { GanttRow } from "./GanttRow";
import { ChevronDown, ChevronUp } from "lucide-react";

interface GanttChartProps {
  epics: Epic[];
  year: number;
}

const MIN_LABEL_WIDTH = 180;
const MAX_LABEL_WIDTH = 500;
const DEFAULT_LABEL_WIDTH = 250;

export function GanttChart({ epics, year }: GanttChartProps) {
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
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
      setExpandedEpics(new Set());
      setAllExpanded(false);
    } else {
      setExpandedEpics(new Set(epics.map((e) => e.id)));
      setAllExpanded(true);
    }
  };

  const totalStories = useMemo(
    () => epics.reduce((sum, epic) => sum + epic.stories.length, 0),
    [epics]
  );

  const completedStories = useMemo(
    () => epics.reduce((sum, epic) => 
      sum + epic.stories.filter((s) => s.status === "Done").length, 0
    ),
    [epics]
  );

  const gridCols = `${labelWidth}px 1fr`;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gantt Chart</CardTitle>
            <CardDescription className="mt-1">
              Visualize epics and user stories across the {year} timeline
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{epics.length} epics</Badge>
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
                Epic / Story
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

            {/* Epic Rows */}
            <div className="relative">
              {epics.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No epics to display. Import or create epics to see them here.
                </div>
              ) : (
                epics.map((epic) => (
                  <GanttRow
                    key={epic.id}
                    epic={epic}
                    year={year}
                    isExpanded={expandedEpics.has(epic.id)}
                    onToggle={() => toggleEpic(epic.id)}
                    labelWidth={labelWidth}
                  />
                ))
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Status Legend */}
        <div className="flex items-center justify-center gap-6 py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Story Status:</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-status-draft" />
            <span className="text-xs">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-status-ready" />
            <span className="text-xs">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-status-in-progress" />
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-status-done" />
            <span className="text-xs">Done</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
