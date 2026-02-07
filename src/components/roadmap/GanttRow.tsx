import React from "react";
import { Epic, UserStory } from "@/types/epic";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  calculateBarStart,
  calculateBarWidth,
  getQuarterColorClass,
  getStatusColorClass,
  calculateStoryPosition,
  calculateEpicProgress,
} from "@/lib/ganttUtils";

interface GanttRowProps {
  epic: Epic;
  year: number;
  isExpanded: boolean;
  onToggle: () => void;
  labelWidth: number;
}

export function GanttRow({ epic, year, isExpanded, onToggle, labelWidth }: GanttRowProps) {
  const barStart = calculateBarStart(epic, year);
  const barWidth = calculateBarWidth(epic, year);
  const progress = calculateEpicProgress(epic);
  const hasStories = epic.stories.length > 0;
  const gridCols = `${labelWidth}px 1fr`;

  return (
    <>
      {/* Epic Row */}
      <div
        className="group grid border-b border-border hover:bg-muted/30 transition-colors"
        style={{ gridTemplateColumns: gridCols }}
      >
        {/* Epic Name */}
        <div
          className="flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-border"
          onClick={hasStories ? onToggle : undefined}
        >
          {hasStories ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )
          ) : (
            <div className="w-4" />
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium truncate flex-1">{epic.title}</span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-semibold">{epic.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {epic.description || "No description"}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{epic.quarter}</Badge>
                {epic.sprint && <Badge variant="secondary" className="text-xs">Sprint {epic.sprint}</Badge>}
              </div>
            </TooltipContent>
          </Tooltip>
          <Badge variant="secondary" className="text-xs ml-auto flex-shrink-0">
            {epic.stories.length}
          </Badge>
        </div>

        {/* Epic Bar */}
        <div className="relative h-10 flex items-center">
          {/* Month grid lines */}
          <div className="absolute inset-0 grid grid-cols-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-border/30 last:border-r-0" />
            ))}
          </div>

          {/* Epic bar */}
          {barWidth > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`absolute h-6 rounded-md ${getQuarterColorClass(epic.quarter)} cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
                  style={{
                    left: `${barStart}%`,
                    width: `${Math.max(barWidth, 2)}%`,
                  }}
                >
                  {/* Progress bar inside */}
                  {progress > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 bg-white/20 rounded-l-md"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  {/* Label */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-2">
                    <span className="text-xs font-medium text-white truncate">
                      {barWidth > 8 ? epic.title : ""}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{epic.title}</p>
                  <p className="text-xs">
                    {epic.quarter} {epic.sprint ? `• Sprint ${epic.sprint}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {epic.stories.length} stories • {progress}% complete
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Story Rows (when expanded) */}
      {isExpanded && epic.stories.map((story, idx) => (
        <StoryRow
          key={story.id}
          story={story}
          epic={epic}
          year={year}
          storyIndex={idx}
          totalStories={epic.stories.length}
          labelWidth={labelWidth}
        />
      ))}
    </>
  );
}

interface StoryRowProps {
  story: UserStory;
  epic: Epic;
  year: number;
  storyIndex: number;
  totalStories: number;
  labelWidth: number;
}

function StoryRow({ story, epic, year, storyIndex, totalStories, labelWidth }: StoryRowProps) {
  const { start, width } = calculateStoryPosition(story, epic, storyIndex, totalStories);
  const gridCols = `${labelWidth}px 1fr`;

  return (
    <div
      className="grid border-b border-border/50 bg-muted/10"
      style={{ gridTemplateColumns: gridCols }}
    >
      {/* Story Name */}
      <div className="flex items-center gap-2 pl-9 pr-3 py-1.5 border-r border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground flex-1 break-words leading-snug">
              {story.title}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="font-medium">{story.title}</p>
            <p className="text-xs mt-1">
              As a {story.asA}, I want {story.iWant}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge className={`text-xs ${getStatusColorClass(story.status)}`}>
                {story.status}
              </Badge>
              {story.storyPoints && (
                <Badge variant="outline" className="text-xs">
                  {story.storyPoints} pts
                </Badge>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        <Badge className={`text-xs capitalize flex-shrink-0 ${getStatusColorClass(story.status)}`}>
          {story.status}
        </Badge>
      </div>

      {/* Story Bar */}
      <div className="relative h-7 flex items-center">
        {/* Month grid lines */}
        <div className="absolute inset-0 grid grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-border/20 last:border-r-0" />
          ))}
        </div>

        {/* Story bar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute h-4 rounded ${getStatusColorClass(story.status)} cursor-pointer opacity-80 hover:opacity-100 transition-opacity`}
              style={{
                left: `${start}%`,
                width: `${Math.max(width, 1)}%`,
              }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{story.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{story.status}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
