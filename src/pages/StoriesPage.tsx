import React, { useState } from "react";
import { useEpics } from "@/contexts/EpicContext";
import { UserStory, Priority, StoryStatus } from "@/types/epic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

export default function StoriesPage() {
  const { epics, updateStory } = useEpics();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedStory, setSelectedStory] = useState<(UserStory & { epicTitle: string }) | null>(null);

  // Flatten all stories with their epic info
  const allStories = epics.flatMap((epic) =>
    epic.stories.map((story) => ({
      ...story,
      epicTitle: epic.title,
      epicId: epic.id,
    }))
  );

  const filteredStories = allStories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.asA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.iWant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || story.status === filterStatus;
    const matchesPriority = filterPriority === "all" || story.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const storiesByStatus = {
    Draft: filteredStories.filter((s) => s.status === "Draft"),
    Ready: filteredStories.filter((s) => s.status === "Ready"),
    "In Progress": filteredStories.filter((s) => s.status === "In Progress"),
    Done: filteredStories.filter((s) => s.status === "Done"),
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "Must":
        return "bg-priority-must text-white";
      case "Should":
        return "bg-priority-should text-white";
      case "Could":
        return "bg-priority-could text-white";
      case "Won't":
        return "bg-priority-wont text-white";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: StoryStatus) => {
    switch (status) {
      case "Draft":
        return <Circle className="h-4 w-4" />;
      case "Ready":
        return <Clock className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Done":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (story: typeof allStories[0], newStatus: StoryStatus) => {
    updateStory(story.epicId, story.id, { status: newStatus });
  };

  if (allStories.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No User Stories Yet</h2>
          <p className="text-muted-foreground">
            Generate user stories from your epics using the AI Story Generator.
          </p>
        </div>
        <Button asChild>
          <a href="/generate">Generate Stories</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Must">Must</SelectItem>
            <SelectItem value="Should">Should</SelectItem>
            <SelectItem value="Could">Could</SelectItem>
            <SelectItem value="Won't">Won't</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(["Draft", "Ready", "In Progress", "Done"] as StoryStatus[]).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <CardTitle className="text-base">{status}</CardTitle>
                </div>
                <Badge variant="secondary">{storiesByStatus[status].length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-2">
                <div className="space-y-3">
                  {storiesByStatus[status].length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No stories
                    </p>
                  ) : (
                    storiesByStatus[status].map((story) => (
                      <div
                        key={story.id}
                        onClick={() => setSelectedStory(story)}
                        className="rounded-lg border bg-card p-3 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">{story.title}</h4>
                          <Badge className={`${getPriorityColor(story.priority)} text-xs shrink-0`}>
                            {story.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          As a {story.asA}, I want {story.iWant}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate max-w-[120px]">
                            {story.epicTitle}
                          </span>
                          <Badge variant="outline">{story.storyPoints} pts</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Story Detail Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedStory?.title}</DialogTitle>
            <DialogDescription>
              From epic: {selectedStory?.epicTitle}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            {selectedStory && (
              <div className="space-y-6">
                {/* User Story Format */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    <span className="font-medium">As a</span> {selectedStory.asA},{" "}
                    <span className="font-medium">I want</span> {selectedStory.iWant},{" "}
                    <span className="font-medium">so that</span> {selectedStory.soThat}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getPriorityColor(selectedStory.priority)}>
                    {selectedStory.priority}
                  </Badge>
                  <Badge variant="outline">{selectedStory.storyPoints} Story Points</Badge>
                  <Badge variant="secondary">{selectedStory.status}</Badge>
                </div>

                <Separator />

                {/* Acceptance Criteria */}
                <div>
                  <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                  <ul className="space-y-2">
                    {selectedStory.acceptanceCriteria.map((criterion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Definition of Done */}
                <div>
                  <h4 className="font-medium mb-2">Definition of Done</h4>
                  <ul className="space-y-2">
                    {selectedStory.definitionOfDone.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                {selectedStory.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStory.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Status Change */}
          {selectedStory && (
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">Change status:</span>
              <div className="flex gap-2">
                {(["Draft", "Ready", "In Progress", "Done"] as StoryStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={selectedStory.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      handleStatusChange(selectedStory, status);
                      setSelectedStory({ ...selectedStory, status });
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
