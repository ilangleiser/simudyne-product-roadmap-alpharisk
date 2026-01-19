import React, { useState, useMemo } from "react";
import { Epic } from "@/types/epic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GanttTimeline } from "./GanttTimeline";
import { GanttRow } from "./GanttRow";
import { Expand, Shrink, ChevronDown, ChevronUp } from "lucide-react";

interface GanttChartProps {
  epics: Epic[];
  year: number;
}

export function GanttChart({ epics, year }: GanttChartProps) {
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

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
            <div className="grid grid-cols-[250px_1fr] border-b border-border sticky top-0 bg-background z-20">
              <div className="px-3 py-2 font-medium text-sm text-muted-foreground border-r border-border bg-muted/30">
                Epic / Story
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
