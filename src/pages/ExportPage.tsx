import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEpics } from "@/contexts/EpicContext";
import { EXPORT_FORMATS, ExportFormat } from "@/types/epic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Check,
  FileText,
  Package,
} from "lucide-react";

export default function ExportPage() {
  const { productId } = useParams<{ productId: string }>();
  const { epics } = useEpics();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat["id"]>("jira");
  const [selectedEpicIds, setSelectedEpicIds] = useState<string[]>([]);
  const [includeAcceptanceCriteria, setIncludeAcceptanceCriteria] = useState(true);
  const [includeDefinitionOfDone, setIncludeDefinitionOfDone] = useState(true);

  const epicsWithStories = epics.filter((e) => e.stories.length > 0);
  const totalStories = epicsWithStories
    .filter((e) => selectedEpicIds.length === 0 || selectedEpicIds.includes(e.id))
    .reduce((acc, epic) => acc + epic.stories.length, 0);

  const toggleEpic = (epicId: string) => {
    setSelectedEpicIds((prev) =>
      prev.includes(epicId) ? prev.filter((id) => id !== epicId) : [...prev, epicId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEpicIds.length === epicsWithStories.length) {
      setSelectedEpicIds([]);
    } else {
      setSelectedEpicIds(epicsWithStories.map((e) => e.id));
    }
  };

  const generateJiraCSV = () => {
    const headers = [
      "Summary",
      "Description",
      "Issue Type",
      "Priority",
      "Story Points",
      "Epic Link",
      "Sprint",
      "Labels",
    ];
    if (includeAcceptanceCriteria) headers.push("Acceptance Criteria");
    if (includeDefinitionOfDone) headers.push("Definition of Done");

    const rows = [headers.join(",")];

    const targetEpics = selectedEpicIds.length > 0
      ? epics.filter((e) => selectedEpicIds.includes(e.id))
      : epicsWithStories;

    targetEpics.forEach((epic) => {
      epic.stories.forEach((story) => {
        const description = `As a ${story.asA}, I want ${story.iWant}, so that ${story.soThat}`;
        const priority = story.priority === "Must" ? "Highest" : 
                        story.priority === "Should" ? "High" :
                        story.priority === "Could" ? "Medium" : "Low";
        
        const row = [
          `"${story.title.replace(/"/g, '""')}"`,
          `"${description.replace(/"/g, '""')}"`,
          "Story",
          priority,
          story.storyPoints,
          `"${epic.title.replace(/"/g, '""')}"`,
          epic.sprint,
          `"${story.tags.join(", ")}"`,
        ];

        if (includeAcceptanceCriteria) {
          row.push(`"${story.acceptanceCriteria.join("\n").replace(/"/g, '""')}"`);
        }
        if (includeDefinitionOfDone) {
          row.push(`"${story.definitionOfDone.join("\n").replace(/"/g, '""')}"`);
        }

        rows.push(row.join(","));
      });
    });

    return rows.join("\n");
  };

  const generateAzureDevOpsCSV = () => {
    const headers = [
      "Work Item Type",
      "Title",
      "Description",
      "Priority",
      "Story Points",
      "Area Path",
      "Iteration Path",
      "Tags",
    ];
    if (includeAcceptanceCriteria) headers.push("Acceptance Criteria");

    const rows = [headers.join(",")];

    const targetEpics = selectedEpicIds.length > 0
      ? epics.filter((e) => selectedEpicIds.includes(e.id))
      : epicsWithStories;

    targetEpics.forEach((epic) => {
      epic.stories.forEach((story) => {
        const description = `<p><strong>As a</strong> ${story.asA}, <strong>I want</strong> ${story.iWant}, <strong>so that</strong> ${story.soThat}</p>`;
        const priority = story.priority === "Must" ? "1" : 
                        story.priority === "Should" ? "2" :
                        story.priority === "Could" ? "3" : "4";
        
        const row = [
          "User Story",
          `"${story.title.replace(/"/g, '""')}"`,
          `"${description.replace(/"/g, '""')}"`,
          priority,
          story.storyPoints,
          `"${epic.title.replace(/"/g, '""')}"`,
          epic.sprint,
          `"${story.tags.join("; ")}"`,
        ];

        if (includeAcceptanceCriteria) {
          const ac = story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("<br/>");
          row.push(`"${ac.replace(/"/g, '""')}"`);
        }

        rows.push(row.join(","));
      });
    });

    return rows.join("\n");
  };

  const generateTrelloJSON = () => {
    const targetEpics = selectedEpicIds.length > 0
      ? epics.filter((e) => selectedEpicIds.includes(e.id))
      : epicsWithStories;

    const cards = targetEpics.flatMap((epic) =>
      epic.stories.map((story) => ({
        name: story.title,
        desc: `**As a** ${story.asA}, **I want** ${story.iWant}, **so that** ${story.soThat}\n\n` +
              (includeAcceptanceCriteria ? `**Acceptance Criteria:**\n${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}\n\n` : "") +
              (includeDefinitionOfDone ? `**Definition of Done:**\n${story.definitionOfDone.map((d) => `- ${d}`).join("\n")}` : ""),
        labels: [story.priority, epic.quarter, ...(story.tags || [])],
        pos: "bottom",
      }))
    );

    return JSON.stringify({ cards }, null, 2);
  };

  const generateAsanaCSV = () => {
    const headers = [
      "Name",
      "Description",
      "Section",
      "Priority",
      "Tags",
    ];

    const rows = [headers.join(",")];

    const targetEpics = selectedEpicIds.length > 0
      ? epics.filter((e) => selectedEpicIds.includes(e.id))
      : epicsWithStories;

    targetEpics.forEach((epic) => {
      epic.stories.forEach((story) => {
        const description = `As a ${story.asA}, I want ${story.iWant}, so that ${story.soThat}`;
        
        const row = [
          `"${story.title.replace(/"/g, '""')}"`,
          `"${description.replace(/"/g, '""')}"`,
          `"${epic.title.replace(/"/g, '""')}"`,
          story.priority,
          `"${story.tags.join(", ")}"`,
        ];

        rows.push(row.join(","));
      });
    });

    return rows.join("\n");
  };

  const handleExport = () => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (selectedFormat) {
      case "jira":
        content = generateJiraCSV();
        filename = "simudyne-stories-jira.csv";
        mimeType = "text/csv";
        break;
      case "azure-devops":
        content = generateAzureDevOpsCSV();
        filename = "simudyne-stories-azure.csv";
        mimeType = "text/csv";
        break;
      case "trello":
        content = generateTrelloJSON();
        filename = "simudyne-stories-trello.json";
        mimeType = "application/json";
        break;
      case "asana":
        content = generateAsanaCSV();
        filename = "simudyne-stories-asana.csv";
        mimeType = "text/csv";
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${totalStories} stories to ${EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.name}`);
  };

  const getFormatIcon = (format: ExportFormat["id"]) => {
    switch (format) {
      case "trello":
        return <FileJson className="h-5 w-5" />;
      default:
        return <FileSpreadsheet className="h-5 w-5" />;
    }
  };

  if (epicsWithStories.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <Download className="h-12 w-12 text-primary" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No Stories to Export</h2>
          <p className="text-muted-foreground">
            Generate user stories from your epics first, then export them to your PM tool.
          </p>
        </div>
        <Button asChild>
          <Link to={`/${productId}/generate`}>Generate Stories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Format Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
            <CardDescription>
              Choose the format for your PM tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(v) => setSelectedFormat(v as ExportFormat["id"])}
              className="grid gap-4 md:grid-cols-2"
            >
              {EXPORT_FORMATS.map((format) => (
                <div key={format.id}>
                  <RadioGroupItem
                    value={format.id}
                    id={format.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={format.id}
                    className="flex cursor-pointer items-start gap-4 rounded-lg border-2 border-muted bg-card p-4 hover:bg-muted/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {getFormatIcon(format.id)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{format.name}</span>
                        <Badge variant="outline">.{format.extension}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h4 className="font-medium">Export Options</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ac"
                    checked={includeAcceptanceCriteria}
                    onCheckedChange={(v) => setIncludeAcceptanceCriteria(!!v)}
                  />
                  <Label htmlFor="ac">Include acceptance criteria</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dod"
                    checked={includeDefinitionOfDone}
                    onCheckedChange={(v) => setIncludeDefinitionOfDone(!!v)}
                  />
                  <Label htmlFor="dod">Include definition of done</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Epic Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Filter by Epic</CardTitle>
                <CardDescription>
                  Optional: select specific epics
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedEpicIds.length === epicsWithStories.length ? "Clear" : "All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {epicsWithStories.map((epic) => (
                  <div
                    key={epic.id}
                    className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors ${
                      selectedEpicIds.includes(epic.id) ? "border-accent bg-accent/5" : ""
                    }`}
                    onClick={() => toggleEpic(epic.id)}
                  >
                    <Checkbox
                      checked={selectedEpicIds.includes(epic.id)}
                      onCheckedChange={() => toggleEpic(epic.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{epic.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {epic.stories.length} stories
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Ready to Export</p>
              <p className="text-sm text-muted-foreground">
                {totalStories} stories from{" "}
                {selectedEpicIds.length > 0 ? selectedEpicIds.length : epicsWithStories.length} epics
              </p>
            </div>
          </div>
          <Button onClick={handleExport} size="lg">
            <Download className="mr-2 h-5 w-5" />
            Export to {EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.name}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
