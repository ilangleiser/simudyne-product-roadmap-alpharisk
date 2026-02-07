import React from "react";
import { Epic } from "@/types/epic";
import { Product } from "@/types/product";
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

interface ProductHeaderRowProps {
  product: Product;
  epicCount: number;
  storyCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  labelWidth: number;
}

export function ProductHeaderRow({
  product,
  epicCount,
  storyCount,
  isExpanded,
  onToggle,
  labelWidth,
}: ProductHeaderRowProps) {
  const gridCols = `${labelWidth}px 1fr`;
  
  // Product-specific color classes
  const productColorClass = {
    horizon: "bg-product-horizon",
    "pulse-sdg": "bg-product-pulse",
    "alpharisk-studio": "bg-product-alpharisk",
  }[product.id] || "bg-primary";

  return (
    <div
      className="group grid border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
      style={{ gridTemplateColumns: gridCols }}
      onClick={onToggle}
    >
      {/* Product Name */}
      <div className="flex items-center gap-2 px-3 py-3 border-r border-border">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className={`h-3 w-3 rounded-sm ${productColorClass} flex-shrink-0`} />
        <span className="text-sm font-semibold truncate flex-1">{product.name}</span>
        <div className="flex gap-1.5 ml-auto flex-shrink-0">
          <Badge variant="secondary" className="text-xs">
            {epicCount} epics
          </Badge>
          <Badge variant="outline" className="text-xs">
            {storyCount} stories
          </Badge>
        </div>
      </div>

      {/* Empty timeline area with subtle background */}
      <div className="relative h-12 flex items-center bg-muted/20">
        {/* Month grid lines */}
        <div className="absolute inset-0 grid grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-border/30 last:border-r-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface EpicRowProps {
  epic: Epic;
  product: Product;
  year: number;
  isExpanded: boolean;
  onToggle: () => void;
  labelWidth: number;
}

export function PortfolioEpicRow({
  epic,
  product,
  year,
  isExpanded,
  onToggle,
  labelWidth,
}: EpicRowProps) {
  const barStart = calculateBarStart(epic, year);
  const barWidth = calculateBarWidth(epic, year);
  const progress = calculateEpicProgress(epic);
  const hasStories = epic.stories.length > 0;
  const gridCols = `${labelWidth}px 1fr`;

  // Product-specific color classes for epic bars
  const productBarColorClass = {
    horizon: "bg-product-horizon",
    "pulse-sdg": "bg-product-pulse",
    "alpharisk-studio": "bg-product-alpharisk",
  }[product.id] || getQuarterColorClass(epic.quarter);

  return (
    <>
      {/* Epic Row */}
      <div
        className="group grid border-b border-border/50 hover:bg-muted/20 transition-colors"
        style={{ gridTemplateColumns: gridCols }}
      >
        {/* Epic Name - indented under product */}
        <div
          className="flex items-center gap-2 pl-9 pr-3 py-2 cursor-pointer border-r border-border"
          onClick={hasStories ? onToggle : undefined}
        >
          {hasStories ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )
          ) : (
            <div className="w-3.5" />
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm truncate flex-1">{epic.title}</span>
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
                  className={`absolute h-6 rounded-md ${productBarColorClass} cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
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
                  <p className="text-xs text-muted-foreground">{product.name}</p>
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
        <PortfolioStoryRow
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
  story: Epic["stories"][0];
  epic: Epic;
  year: number;
  storyIndex: number;
  totalStories: number;
  labelWidth: number;
}

function PortfolioStoryRow({ story, epic, year, storyIndex, totalStories, labelWidth }: StoryRowProps) {
  const { start, width } = calculateStoryPosition(story, epic, storyIndex, totalStories);
  const gridCols = `${labelWidth}px 1fr`;

  return (
    <div
      className="grid border-b border-border/30 bg-muted/5"
      style={{ gridTemplateColumns: gridCols }}
    >
      {/* Story Name - further indented */}
      <div className="flex items-start gap-2 pl-14 pr-3 py-1.5 border-r border-border min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground flex-1 min-w-0 break-words leading-snug">
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
