import React, { useState } from "react";
import { useEpics } from "@/contexts/EpicContext";
import { Epic, UserStory, Priority } from "@/types/epic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getStatusColorClass } from "@/lib/ganttUtils";

export default function EpicsPage() {
  const { epics, addEpic, updateEpic, deleteEpic } = useEpics();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuarter, setFilterQuarter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());

  const toggleEpicExpansion = (epicId: string) => {
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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quarter: "Q1" as Epic["quarter"],
    sprint: "",
    customer: "",
    module: "" as Epic["module"] | "",
  });

  const filteredEpics = epics.filter((epic) => {
    const matchesSearch =
      epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuarter = filterQuarter === "all" || epic.quarter === filterQuarter;
    return matchesSearch && matchesQuarter;
  });

  const handleCreateEpic = () => {
    if (!formData.title || !formData.sprint) {
      toast.error("Please fill in required fields");
      return;
    }

    const now = new Date().toISOString();
    const newEpic: Epic = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      quarter: formData.quarter,
      sprint: formData.sprint,
      customer: formData.customer || undefined,
      module: formData.module as Epic["module"] || undefined,
      stories: [],
      createdAt: now,
      updatedAt: now,
    };

    addEpic(newEpic);
    toast.success("Epic created successfully");
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdateEpic = () => {
    if (!editingEpic || !formData.title || !formData.sprint) {
      toast.error("Please fill in required fields");
      return;
    }

    updateEpic(editingEpic.id, {
      title: formData.title,
      description: formData.description,
      quarter: formData.quarter,
      sprint: formData.sprint,
      customer: formData.customer || undefined,
      module: formData.module as Epic["module"] || undefined,
    });

    toast.success("Epic updated successfully");
    setEditingEpic(null);
    resetForm();
  };

  const handleDeleteEpic = (id: string) => {
    deleteEpic(id);
    toast.success("Epic deleted");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      quarter: "Q1",
      sprint: "",
      customer: "",
      module: "",
    });
  };

  const openEditDialog = (epic: Epic) => {
    setFormData({
      title: epic.title,
      description: epic.description,
      quarter: epic.quarter,
      sprint: epic.sprint,
      customer: epic.customer || "",
      module: epic.module || "",
    });
    setEditingEpic(epic);
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

  const getQuarterColor = (quarter: string) => {
    switch (quarter) {
      case "Q1":
        return "bg-quarter-q1 text-white";
      case "Q2":
        return "bg-quarter-q2 text-white";
      case "Q3":
        return "bg-quarter-q3 text-white";
      case "Q4":
        return "bg-quarter-q4 text-white";
      default:
        return "";
    }
  };

  const EpicForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Epic Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Factor Evaluation Implementation"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the epic scope and objectives..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quarter">Quarter</Label>
          <Select
            value={formData.quarter}
            onValueChange={(v) => setFormData({ ...formData, quarter: v as Epic["quarter"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1</SelectItem>
              <SelectItem value="Q2">Q2</SelectItem>
              <SelectItem value="Q3">Q3</SelectItem>
              <SelectItem value="Q4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sprint">
            Sprint <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sprint"
            value={formData.sprint}
            onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
            placeholder="e.g., Sprint 1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Input
            id="customer"
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            placeholder="e.g., SMBC-GIC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="module">Module</Label>
          <Select
            value={formData.module}
            onValueChange={(v) => setFormData({ ...formData, module: v as Epic["module"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Model">Model</SelectItem>
              <SelectItem value="Pipeline">Pipeline</SelectItem>
              <SelectItem value="Containers">Containers</SelectItem>
              <SelectItem value="Release">Release</SelectItem>
              <SelectItem value="Documentation">Documentation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search epics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterQuarter} onValueChange={setFilterQuarter}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Q1">Q1</SelectItem>
              <SelectItem value="Q2">Q2</SelectItem>
              <SelectItem value="Q3">Q3</SelectItem>
              <SelectItem value="Q4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Epic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Epic</DialogTitle>
              <DialogDescription>
                Add a new epic to your roadmap. You can generate user stories for it later.
              </DialogDescription>
            </DialogHeader>
            <EpicForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEpic}>Create Epic</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Epics Grid */}
      {filteredEpics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No epics found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {epics.length === 0
                ? "Create your first epic or import from a spreadsheet."
                : "Try adjusting your search or filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEpics.map((epic) => {
            const isExpanded = expandedEpics.has(epic.id);
            return (
              <Collapsible
                key={epic.id}
                open={isExpanded}
                onOpenChange={() => toggleEpicExpansion(epic.id)}
              >
                <Card className="group transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getQuarterColor(epic.quarter)}>{epic.quarter}</Badge>
                          <Badge variant="outline">Sprint {epic.sprint}</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-1">{epic.title}</CardTitle>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(epic);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEpic(epic.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{epic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {epic.customer && (
                          <Badge variant="secondary">{epic.customer}</Badge>
                        )}
                        {epic.module && (
                          <Badge variant="outline">{epic.module}</Badge>
                        )}
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 hover:bg-muted"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {epic.stories.length} stories
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-3">
                      {epic.stories.length === 0 ? (
                        <div className="flex items-center justify-center py-4 border-t">
                          <Button asChild variant="outline" size="sm">
                            <Link to="/generate">
                              <Sparkles className="mr-1 h-3 w-3" />
                              Generate Stories
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="border-t pt-3 space-y-2">
                          {epic.stories.map((story) => (
                            <div
                              key={story.id}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColorClass(story.status)}`}
                                />
                                <span className="text-sm truncate">{story.title}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={getPriorityColor(story.priority)} variant="secondary">
                                  {story.priority}
                                </Badge>
                                <span className="text-xs text-muted-foreground w-12 text-right">
                                  {story.storyPoints} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEpic} onOpenChange={(open) => !open && setEditingEpic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Epic</DialogTitle>
            <DialogDescription>
              Update the epic details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <EpicForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEpic(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEpic}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
