import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Epic, UserStory, RoadmapItem } from "@/types/epic";
import { seedEpics } from "@/data/seedData";

interface EpicContextType {
  epics: Epic[];
  selectedEpic: Epic | null;
  isLoading: boolean;
  setEpics: (epics: Epic[]) => void;
  addEpic: (epic: Epic) => void;
  updateEpic: (id: string, updates: Partial<Epic>) => void;
  deleteEpic: (id: string) => void;
  selectEpic: (epic: Epic | null) => void;
  addStoryToEpic: (epicId: string, story: UserStory) => void;
  updateStory: (epicId: string, storyId: string, updates: Partial<UserStory>) => void;
  deleteStory: (epicId: string, storyId: string) => void;
  importRoadmapItems: (items: RoadmapItem[]) => void;
  clearAllData: () => void;
}

const EpicContext = createContext<EpicContextType | undefined>(undefined);

const STORAGE_KEY = "simudyne-epics";

export function EpicProvider({ children }: { children: React.ReactNode }) {
  const [epics, setEpicsState] = useState<Epic[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount, seed if empty
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedEpics = JSON.parse(stored);
        if (parsedEpics.length > 0) {
          setEpicsState(parsedEpics);
        } else {
          // Seed with initial data if storage is empty
          setEpicsState(seedEpics);
        }
      } else {
        // No storage found, seed with initial data
        setEpicsState(seedEpics);
      }
    } catch (error) {
      console.error("Failed to load epics from storage:", error);
      setEpicsState(seedEpics);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(epics));
    }
  }, [epics, isLoading]);

  const setEpics = useCallback((newEpics: Epic[]) => {
    setEpicsState(newEpics);
  }, []);

  const addEpic = useCallback((epic: Epic) => {
    setEpicsState((prev) => [...prev, epic]);
  }, []);

  const updateEpic = useCallback((id: string, updates: Partial<Epic>) => {
    setEpicsState((prev) =>
      prev.map((epic) =>
        epic.id === id
          ? { ...epic, ...updates, updatedAt: new Date().toISOString() }
          : epic
      )
    );
    setSelectedEpic((prev) =>
      prev?.id === id ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev
    );
  }, []);

  const deleteEpic = useCallback((id: string) => {
    setEpicsState((prev) => prev.filter((epic) => epic.id !== id));
    setSelectedEpic((prev) => (prev?.id === id ? null : prev));
  }, []);

  const selectEpic = useCallback((epic: Epic | null) => {
    setSelectedEpic(epic);
  }, []);

  const addStoryToEpic = useCallback((epicId: string, story: UserStory) => {
    setEpicsState((prev) =>
      prev.map((epic) =>
        epic.id === epicId
          ? { ...epic, stories: [...epic.stories, story], updatedAt: new Date().toISOString() }
          : epic
      )
    );
  }, []);

  const updateStory = useCallback(
    (epicId: string, storyId: string, updates: Partial<UserStory>) => {
      setEpicsState((prev) =>
        prev.map((epic) =>
          epic.id === epicId
            ? {
                ...epic,
                stories: epic.stories.map((story) =>
                  story.id === storyId
                    ? { ...story, ...updates, updatedAt: new Date().toISOString() }
                    : story
                ),
                updatedAt: new Date().toISOString(),
              }
            : epic
        )
      );
    },
    []
  );

  const deleteStory = useCallback((epicId: string, storyId: string) => {
    setEpicsState((prev) =>
      prev.map((epic) =>
        epic.id === epicId
          ? {
              ...epic,
              stories: epic.stories.filter((story) => story.id !== storyId),
              updatedAt: new Date().toISOString(),
            }
          : epic
      )
    );
  }, []);

  const importRoadmapItems = useCallback((items: RoadmapItem[]) => {
    const now = new Date().toISOString();
    const newEpics: Epic[] = [];

    // Group items by epic name
    const epicGroups = new Map<string, RoadmapItem[]>();
    items.forEach((item) => {
      const existing = epicGroups.get(item.epic) || [];
      epicGroups.set(item.epic, [...existing, item]);
    });

    epicGroups.forEach((groupItems, epicName) => {
      const firstItem = groupItems[0];
      const epic: Epic = {
        id: crypto.randomUUID(),
        title: epicName,
        description: groupItems.map((i) => `${i.feature}: ${i.description}`).join("\n"),
        quarter: firstItem.quarter,
        sprint: firstItem.sprint,
        customer: firstItem.customer,
        startDate: firstItem.startDate,
        endDate: firstItem.endDate,
        module: firstItem.module as Epic["module"],
        stories: [],
        createdAt: now,
        updatedAt: now,
      };
      newEpics.push(epic);
    });

    setEpicsState((prev) => [...prev, ...newEpics]);
  }, []);

  const clearAllData = useCallback(() => {
    setEpicsState([]);
    setSelectedEpic(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <EpicContext.Provider
      value={{
        epics,
        selectedEpic,
        isLoading,
        setEpics,
        addEpic,
        updateEpic,
        deleteEpic,
        selectEpic,
        addStoryToEpic,
        updateStory,
        deleteStory,
        importRoadmapItems,
        clearAllData,
      }}
    >
      {children}
    </EpicContext.Provider>
  );
}

export function useEpics() {
  const context = useContext(EpicContext);
  if (context === undefined) {
    throw new Error("useEpics must be used within an EpicProvider");
  }
  return context;
}
