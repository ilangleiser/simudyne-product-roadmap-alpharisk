export type Priority = "Must" | "Should" | "Could" | "Won't";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type StoryStatus = "Draft" | "Ready" | "In Progress" | "Done";
export type Module = "Model" | "Pipeline" | "Containers" | "Release" | "Documentation";

export interface Epic {
  id: string;
  productId: string;
  title: string;
  description: string;
  quarter: Quarter;
  sprint: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  module?: Module;
  dependencies?: string[];
  stories: UserStory[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStory {
  id: string;
  epicId: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  priority: Priority;
  definitionOfDone: string[];
  status: StoryStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  epic: string;
  sprint: string;
  quarter: Quarter;
  feature: string;
  description: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  module?: string;
}

export interface ImportMapping {
  epic: string;
  sprint: string;
  quarter: string;
  feature: string;
  description: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  module?: string;
}

export interface ExportFormat {
  id: "jira" | "azure-devops" | "trello" | "asana";
  name: string;
  description: string;
  extension: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { id: "jira", name: "Jira", description: "CSV format with custom fields", extension: "csv" },
  { id: "azure-devops", name: "Azure DevOps", description: "Work Item format", extension: "csv" },
  { id: "trello", name: "Trello", description: "JSON import format", extension: "json" },
  { id: "asana", name: "Asana", description: "CSV format", extension: "csv" },
];

export const STORY_TEMPLATES = {
  feature: {
    name: "Feature Story",
    asA: "product user",
    iWantPrefix: "to be able to",
    soThatPrefix: "I can",
    acceptanceCriteria: [
      "Given [context], when [action], then [expected result]",
      "The feature handles edge cases gracefully",
      "Performance meets defined SLAs",
    ],
    definitionOfDone: [
      "Code reviewed and approved",
      "Unit tests written and passing",
      "Documentation updated",
      "Deployed to staging environment",
    ],
  },
  technical: {
    name: "Technical Story",
    asA: "development team",
    iWantPrefix: "to implement",
    soThatPrefix: "we can",
    acceptanceCriteria: [
      "Implementation follows architecture guidelines",
      "All tests pass in CI/CD pipeline",
      "No security vulnerabilities introduced",
    ],
    definitionOfDone: [
      "Code reviewed by senior engineer",
      "Integration tests written",
      "Infrastructure changes documented",
      "Monitoring and alerting configured",
    ],
  },
  documentation: {
    name: "Documentation Story",
    asA: "stakeholder",
    iWantPrefix: "to have documentation for",
    soThatPrefix: "I can understand",
    acceptanceCriteria: [
      "Documentation is clear and comprehensive",
      "Examples and diagrams included where helpful",
      "Reviewed by subject matter expert",
    ],
    definitionOfDone: [
      "Technical review completed",
      "Published to documentation site",
      "Team notified of updates",
    ],
  },
};
