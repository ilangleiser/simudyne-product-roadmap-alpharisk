import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEpics } from "@/contexts/EpicContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Layers,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { PortfolioGanttChart, ProductEpics } from "@/components/roadmap/PortfolioGanttChart";
import { PRODUCTS } from "@/types/product";
import { Epic } from "@/types/epic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORAGE_PREFIX = "simudyne-epics-";

export default function Dashboard() {
  const { productId } = useParams<{ productId: string }>();
  const { epics, isLoading } = useEpics();
  const [productData, setProductData] = useState<ProductEpics[]>([]);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    // Load epic data for all products from localStorage
    const allProductData: ProductEpics[] = [];
    
    PRODUCTS.forEach((product) => {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${product.id}`);
        if (stored) {
          const loadedEpics: Epic[] = JSON.parse(stored);
          allProductData.push({ product, epics: loadedEpics });
        } else {
          allProductData.push({ product, epics: [] });
        }
      } catch {
        allProductData.push({ product, epics: [] });
      }
    });

    setProductData(allProductData);
  }, []);

  const totalStories = epics.reduce((acc, epic) => acc + epic.stories.length, 0);
  const storiesByStatus = epics.reduce(
    (acc, epic) => {
      epic.stories.forEach((story) => {
        acc[story.status] = (acc[story.status] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const epicsByQuarter = epics.reduce(
    (acc, epic) => {
      acc[epic.quarter] = (acc[epic.quarter] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const customers = [...new Set(epics.filter((e) => e.customer).map((e) => e.customer))];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (epics.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-accent/10 p-6">
          <Upload className="h-12 w-12 text-accent" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to Simudyne Product Roadmap
          </h2>
          <p className="text-muted-foreground">
            Start by importing your roadmap spreadsheet to generate AI-powered user stories
            with agile best practices.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link to={`/${productId}/import`}>
              <Upload className="mr-2 h-5 w-5" />
              Import Roadmap
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={`/${productId}/epics`}>
              <Layers className="mr-2 h-5 w-5" />
              Create Manually
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Epics
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{epics.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(epicsByQuarter).length} quarters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Stories
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStories}</div>
            <p className="text-xs text-muted-foreground">
              {storiesByStatus["Done"] || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active stakeholders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStories > 0
                ? Math.round(((storiesByStatus["Done"] || 0) / totalStories) * 100)
                : 0}
              %
            </div>
            <Progress
              value={
                totalStories > 0
                  ? ((storiesByStatus["Done"] || 0) / totalStories) * 100
                  : 0
              }
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <Link to={`/${productId}/generate`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">Generate Stories</CardTitle>
                  <CardDescription>AI-powered user story creation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use AI to automatically generate detailed user stories from your epics
                with acceptance criteria and story points.
              </p>
              <Button variant="link" className="mt-2 p-0 h-auto">
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <Link to={`/${productId}/roadmap`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">View Roadmap</CardTitle>
                  <CardDescription>Timeline visualization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See your epics laid out on a quarterly timeline with dependency
                mapping and sprint assignments.
              </p>
              <Button variant="link" className="mt-2 p-0 h-auto">
                View timeline <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <Link to={`/${productId}/export`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <FileText className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-base">Export Stories</CardTitle>
                  <CardDescription>Jira, Azure DevOps & more</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export your user stories to popular PM tools like Jira, Azure
                DevOps, Trello, and Asana.
              </p>
              <Button variant="link" className="mt-2 p-0 h-auto">
                Export now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Epics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Epics</CardTitle>
              <CardDescription>Your latest imported or created epics</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/${productId}/epics`}>View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {epics.slice(0, 5).map((epic) => (
              <div
                key={epic.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{epic.title}</h4>
                    <Badge variant="outline">{epic.quarter}</Badge>
                    {epic.customer && (
                      <Badge variant="secondary">{epic.customer}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {epic.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {epic.stories.length} stories
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sprint {epic.sprint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Gantt Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Simudyne Portfolio Roadmap</h2>
            <p className="text-sm text-muted-foreground">All products timeline overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <PortfolioGanttChart productData={productData} year={selectedYear} />
      </div>
    </div>
  );
}
