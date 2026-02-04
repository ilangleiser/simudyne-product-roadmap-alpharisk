import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEpics } from "@/contexts/EpicContext";
import { UserStory, Priority, STORY_TEMPLATES } from "@/types/epic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  Loader2,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function GeneratePage() {
  const { productId } = useParams<{ productId: string }>();
  const { epics, addStoryToEpic } = useEpics();
  const [selectedEpicIds, setSelectedEpicIds] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedStories, setGeneratedStories] = useState<Map<string, UserStory[]>>(new Map());

  const epicsWithoutStories = epics.filter((e) => e.stories.length === 0);

  const handleSelectAll = () => {
    if (selectedEpicIds.length === epicsWithoutStories.length) {
      setSelectedEpicIds([]);
    } else {
      setSelectedEpicIds(epicsWithoutStories.map((e) => e.id));
    }
  };

  const toggleEpic = (epicId: string) => {
    setSelectedEpicIds((prev) =>
      prev.includes(epicId) ? prev.filter((id) => id !== epicId) : [...prev, epicId]
    );
  };

  const generateStories = async () => {
    if (selectedEpicIds.length === 0) {
      toast.error("Please select at least one epic");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedStories(new Map());

    try {
      const selectedEpics = epics.filter((e) => selectedEpicIds.includes(e.id));
      const totalEpics = selectedEpics.length;
      
      for (let i = 0; i < selectedEpics.length; i++) {
        const epic = selectedEpics[i];
        setProgress(Math.round(((i + 0.5) / totalEpics) * 100));

        // Call the edge function to generate stories
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              epic: {
                title: epic.title,
                description: epic.description,
                quarter: epic.quarter,
                sprint: epic.sprint,
                customer: epic.customer,
                module: epic.module,
              },
              customPrompt,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 429) {
            toast.error("Rate limit exceeded. Please try again later.");
            break;
          }
          if (response.status === 402) {
            toast.error("AI credits depleted. Please add funds to continue.");
            break;
          }
          throw new Error(errorData.error || "Failed to generate stories");
        }

        const data = await response.json();
        const stories: UserStory[] = data.stories.map((s: any) => ({
          id: crypto.randomUUID(),
          epicId: epic.id,
          title: s.title,
          asA: s.asA,
          iWant: s.iWant,
          soThat: s.soThat,
          acceptanceCriteria: s.acceptanceCriteria || [],
          storyPoints: s.storyPoints || 3,
          priority: s.priority || "Should",
          definitionOfDone: s.definitionOfDone || [],
          status: "Draft",
          tags: s.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        setGeneratedStories((prev) => new Map(prev).set(epic.id, stories));
        setProgress(Math.round(((i + 1) / totalEpics) * 100));
      }

      toast.success("Stories generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate stories");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveStories = () => {
    let count = 0;
    generatedStories.forEach((stories, epicId) => {
      stories.forEach((story) => {
        addStoryToEpic(epicId, story);
        count++;
      });
    });
    toast.success(`Saved ${count} stories to epics`);
    setGeneratedStories(new Map());
    setSelectedEpicIds([]);
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

  if (epics.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-accent/10 p-6">
          <Sparkles className="h-12 w-12 text-accent" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No Epics to Generate From</h2>
          <p className="text-muted-foreground">
            Import your roadmap or create epics first, then use AI to generate detailed user stories.
          </p>
        </div>
        <Button asChild>
          <Link to={`/${productId}/import`}>Import Roadmap</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Epic Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Epics</CardTitle>
                  <CardDescription>
                    Choose which epics to generate user stories for
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedEpicIds.length === epicsWithoutStories.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {epicsWithoutStories.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      All epics already have stories!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {epicsWithoutStories.map((epic) => (
                      <div
                        key={epic.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          selectedEpicIds.includes(epic.id)
                            ? "border-accent bg-accent/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleEpic(epic.id)}
                      >
                        <Checkbox
                          checked={selectedEpicIds.includes(epic.id)}
                          onCheckedChange={() => toggleEpic(epic.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{epic.quarter}</Badge>
                            <span className="font-medium text-sm truncate">{epic.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {epic.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom Instructions (Optional)</CardTitle>
              <CardDescription>
                Add specific requirements or context for story generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Focus on compliance requirements, include performance criteria, use financial risk terminology..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <Button
            onClick={generateStories}
            disabled={isGenerating || selectedEpicIds.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Stories...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Stories for {selectedEpicIds.length} Epic{selectedEpicIds.length !== 1 && "s"}
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Right Panel - Generated Stories Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Stories</CardTitle>
                <CardDescription>
                  Review and save generated user stories
                </CardDescription>
              </div>
              {generatedStories.size > 0 && (
                <Button onClick={saveStories}>
                  Save All Stories
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {generatedStories.size === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Stories Generated Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select epics and click generate to create user stories
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(generatedStories.entries()).map(([epicId, stories]) => {
                    const epic = epics.find((e) => e.id === epicId);
                    return (
                      <div key={epicId}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">
                          {epic?.title}
                        </h4>
                        <div className="space-y-3">
                          {stories.map((story, index) => (
                            <div key={story.id} className="rounded-lg border p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h5 className="font-medium">{story.title}</h5>
                                <Badge className={getPriorityColor(story.priority)}>
                                  {story.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                As a <span className="text-foreground">{story.asA}</span>, I want{" "}
                                <span className="text-foreground">{story.iWant}</span>, so that{" "}
                                <span className="text-foreground">{story.soThat}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{story.storyPoints} pts</Badge>
                                <Badge variant="secondary">
                                  {story.acceptanceCriteria.length} criteria
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
