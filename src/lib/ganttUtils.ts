import { Epic, UserStory } from "@/types/epic";

// Month configuration for timeline
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const;

// Quarter to month mapping
export const QUARTER_TO_MONTHS: Record<string, number[]> = {
  Q1: [0, 1, 2],   // Jan, Feb, Mar
  Q2: [3, 4, 5],   // Apr, May, Jun
  Q3: [6, 7, 8],   // Jul, Aug, Sep
  Q4: [9, 10, 11], // Oct, Nov, Dec
};

// Get start month index for a quarter
export function getQuarterStartMonth(quarter: string): number {
  return QUARTER_TO_MONTHS[quarter]?.[0] ?? 0;
}

// Get end month index for a quarter
export function getQuarterEndMonth(quarter: string): number {
  const months = QUARTER_TO_MONTHS[quarter];
  return months ? months[months.length - 1] : 2;
}

// Calculate bar position as percentage (0-100)
export function calculateBarStart(epic: Epic, year: number): number {
  // If we have explicit start date, use it
  if (epic.startDate) {
    const startDate = new Date(epic.startDate);
    if (startDate.getFullYear() === year) {
      const dayOfYear = getDayOfYear(startDate);
      return (dayOfYear / 365) * 100;
    }
    // If before this year, start at 0
    if (startDate.getFullYear() < year) return 0;
    // If after this year, start at 100 (won't show)
    return 100;
  }

  // Fall back to quarter-based calculation
  const startMonth = getQuarterStartMonth(epic.quarter);
  return (startMonth / 12) * 100;
}

// Calculate bar width as percentage
export function calculateBarWidth(epic: Epic, year: number): number {
  // If we have explicit dates, use them
  if (epic.startDate && epic.endDate) {
    const startDate = new Date(epic.startDate);
    const endDate = new Date(epic.endDate);
    
    // Clamp to current year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    const effectiveStart = startDate < yearStart ? yearStart : startDate;
    const effectiveEnd = endDate > yearEnd ? yearEnd : endDate;
    
    if (effectiveStart > yearEnd || effectiveEnd < yearStart) {
      return 0; // Epic doesn't overlap with this year
    }
    
    const startDayOfYear = getDayOfYear(effectiveStart);
    const endDayOfYear = getDayOfYear(effectiveEnd);
    
    return ((endDayOfYear - startDayOfYear + 1) / 365) * 100;
  }

  // Fall back to quarter-based calculation (full quarter width)
  const startMonth = getQuarterStartMonth(epic.quarter);
  const endMonth = getQuarterEndMonth(epic.quarter);
  return ((endMonth - startMonth + 1) / 12) * 100;
}

// Get day of year (1-365)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Get quarter color class
export function getQuarterColorClass(quarter: string): string {
  switch (quarter) {
    case "Q1": return "bg-quarter-q1";
    case "Q2": return "bg-quarter-q2";
    case "Q3": return "bg-quarter-q3";
    case "Q4": return "bg-quarter-q4";
    default: return "bg-muted";
  }
}

// Get quarter text color class
export function getQuarterTextColorClass(quarter: string): string {
  switch (quarter) {
    case "Q1": return "text-blue-200";
    case "Q2": return "text-green-200";
    case "Q3": return "text-amber-200";
    case "Q4": return "text-rose-200";
    default: return "text-muted-foreground";
  }
}

// Get status color class for stories
export function getStatusColorClass(status: string): string {
  switch (status) {
    case "Done": return "bg-status-done";
    case "In Progress": return "bg-status-in-progress";
    case "Ready": return "bg-status-ready";
    case "Draft":
    default: return "bg-status-draft";
  }
}

// Calculate story position within epic's timeline
export function calculateStoryPosition(
  story: UserStory,
  epic: Epic,
  storyIndex: number,
  totalStories: number
): { start: number; width: number } {
  // Distribute stories evenly across the epic's timeline
  const epicStart = calculateBarStart(epic, 2026);
  const epicWidth = calculateBarWidth(epic, 2026);
  
  const segmentWidth = epicWidth / Math.max(totalStories, 1);
  const start = epicStart + (storyIndex * segmentWidth);
  const width = segmentWidth * 0.9; // Slight gap between stories
  
  return { start, width };
}

// Format date for display
export function formatDateShort(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Calculate completion percentage for an epic
export function calculateEpicProgress(epic: Epic): number {
  if (epic.stories.length === 0) return 0;
  const doneStories = epic.stories.filter((s) => s.status === "Done").length;
  return Math.round((doneStories / epic.stories.length) * 100);
}

// Get today's position as percentage of year
export function getTodayPosition(year: number): number | null {
  const today = new Date();
  if (today.getFullYear() !== year) return null;
  const dayOfYear = getDayOfYear(today);
  return (dayOfYear / 365) * 100;
}
