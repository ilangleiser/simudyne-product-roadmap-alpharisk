import React, { useState } from "react";
import { useEpics } from "@/contexts/EpicContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Layers, ChevronLeft, ChevronRight, GanttChart as GanttChartIcon } from "lucide-react";
import { GanttChart } from "@/components/roadmap/GanttChart";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
const SPRINTS_PER_QUARTER = 3;

export default function RoadmapPage() {
  const { epics } = useEpics();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [view, setView] = useState<"quarter" | "sprint" | "gantt">("quarter");

  const getQuarterColor = (quarter: string) => {
    switch (quarter) {
      case "Q1":
        return "bg-quarter-q1";
      case "Q2":
        return "bg-quarter-q2";
      case "Q3":
        return "bg-quarter-q3";
      case "Q4":
        return "bg-quarter-q4";
      default:
        return "bg-muted";
    }
  };

  const getQuarterBorderColor = (quarter: string) => {
    switch (quarter) {
      case "Q1":
        return "border-quarter-q1";
      case "Q2":
        return "border-quarter-q2";
      case "Q3":
        return "border-quarter-q3";
      case "Q4":
        return "border-quarter-q4";
      default:
        return "border-muted";
    }
  };

  const epicsByQuarter = QUARTERS.reduce(
    (acc, quarter) => {
      acc[quarter] = epics.filter((epic) => epic.quarter === quarter);
      return acc;
    },
    {} as Record<string, typeof epics>
  );

  const allSprints = epics.reduce((acc, epic) => {
    if (epic.sprint && !acc.includes(epic.sprint)) {
      acc.push(epic.sprint);
    }
    return acc;
  }, [] as string[]).sort();

  if (epics.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No Roadmap Data</h2>
          <p className="text-muted-foreground">
            Import your roadmap spreadsheet or create epics to see them on the timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedYear((y) => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{selectedYear}</h2>
          <Button variant="outline" size="icon" onClick={() => setSelectedYear((y) => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select value={view} onValueChange={(v) => setView(v as "quarter" | "sprint" | "gantt")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">By Quarter</SelectItem>
            <SelectItem value="sprint">By Sprint</SelectItem>
            <SelectItem value="gantt">Gantt Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline View */}
      {view === "gantt" ? (
        <GanttChart epics={epics} year={selectedYear} />
      ) : view === "quarter" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {QUARTERS.map((quarter) => (
            <Card key={quarter} className={`border-t-4 ${getQuarterBorderColor(quarter)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{quarter} {selectedYear}</CardTitle>
                  <Badge variant="secondary">{epicsByQuarter[quarter].length} epics</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {epicsByQuarter[quarter].length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No epics in this quarter
                      </p>
                    ) : (
                      epicsByQuarter[quarter].map((epic) => (
                        <Tooltip key={epic.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`rounded-lg border-l-4 ${getQuarterBorderColor(quarter)} bg-card p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                            >
                              <h4 className="font-medium text-sm line-clamp-1">{epic.title}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Sprint {epic.sprint}
                                </Badge>
                                {epic.customer && (
                                  <Badge variant="secondary" className="text-xs">
                                    {epic.customer}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>{epic.stories.length} stories</span>
                                {epic.module && <span>{epic.module}</span>}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="font-medium">{epic.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {epic.description || "No description"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sprint Timeline</CardTitle>
            <CardDescription>Epics organized by sprint across all quarters</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[150px_1fr] gap-4">
                  {/* Sprint headers */}
                  <div className="font-medium text-muted-foreground">Epic</div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(allSprints.length, 6)}, 1fr)` }}>
                    {(allSprints.length > 0 ? allSprints : Array.from({ length: 6 }, (_, i) => `Sprint ${i + 1}`)).map((sprint) => (
                      <div key={sprint} className="text-center text-sm font-medium text-muted-foreground">
                        {sprint}
                      </div>
                    ))}
                  </div>

                  {/* Epic rows */}
                  {epics.map((epic) => {
                    const sprintIndex = allSprints.indexOf(epic.sprint);
                    return (
                      <React.Fragment key={epic.id}>
                        <div className="flex items-center">
                          <span className="font-medium text-sm truncate">{epic.title}</span>
                        </div>
                        <div
                          className="grid gap-2"
                          style={{ gridTemplateColumns: `repeat(${Math.max(allSprints.length, 6)}, 1fr)` }}
                        >
                          {(allSprints.length > 0 ? allSprints : Array.from({ length: 6 }, (_, i) => `Sprint ${i + 1}`)).map((sprint, index) => (
                            <div key={sprint} className="h-8 flex items-center justify-center">
                              {(sprintIndex === index || (!allSprints.length && epic.sprint === sprint)) && (
                                <div className={`h-6 w-full rounded ${getQuarterColor(epic.quarter)}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Legend - only show for quarter/sprint views */}
      {view !== "gantt" && (
        <Card>
          <CardContent className="flex items-center justify-center gap-6 py-4">
            <span className="text-sm text-muted-foreground">Legend:</span>
            {QUARTERS.map((quarter) => (
              <div key={quarter} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${getQuarterColor(quarter)}`} />
                <span className="text-sm">{quarter}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
