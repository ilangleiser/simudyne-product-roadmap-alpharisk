import React from "react";
import { MONTHS, getTodayPosition } from "@/lib/ganttUtils";

interface GanttTimelineProps {
  year: number;
  showToday?: boolean;
}

export function GanttTimeline({ year, showToday = true }: GanttTimelineProps) {
  const todayPosition = showToday ? getTodayPosition(year) : null;

  return (
    <div className="relative">
      {/* Quarter headers */}
      <div className="grid grid-cols-4 border-b border-border">
        {["Q1", "Q2", "Q3", "Q4"].map((quarter, idx) => (
          <div
            key={quarter}
            className={`py-2 text-center text-sm font-semibold border-r border-border last:border-r-0 ${
              idx === 0 ? "text-quarter-q1" :
              idx === 1 ? "text-quarter-q2" :
              idx === 2 ? "text-quarter-q3" :
              "text-quarter-q4"
            }`}
          >
            {quarter} {year}
          </div>
        ))}
      </div>

      {/* Month headers */}
      <div className="grid grid-cols-12 border-b border-border">
        {MONTHS.map((month, idx) => (
          <div
            key={month}
            className="py-1.5 text-center text-xs text-muted-foreground border-r border-border/50 last:border-r-0"
          >
            {month}
          </div>
        ))}
      </div>

      {/* Today marker */}
      {todayPosition !== null && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
          style={{ left: `${todayPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] px-1 rounded">
            Today
          </div>
        </div>
      )}
    </div>
  );
}
