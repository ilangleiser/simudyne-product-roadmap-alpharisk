import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Epic, UserStory, RoadmapItem } from "@/types/epic";
import { seedEpics, pulseSdgSeedEpics } from "@/data/seedData";

interface EpicContextType {
  epics: Epic[];
  selectedEpic: Epic | null;
  isLoading: boolean;
  currentProductId: string | null;
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

const getStorageKey = (productId: string) => `simudyne-epics-${productId}`;

const getSeedData = (productId: string): Epic[] => {
  switch (productId) {
    case "horizon":
      return seedEpics;
    case "pulse-sdg":
      return pulseSdgSeedEpics;
    default:
      return [];
  }
};

export function EpicProvider({ children }: { children: React.ReactNode }) {
  const { productId } = useParams<{ productId: string }>();
  const [epics, setEpicsState] = useState<Epic[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentProductId = productId || null;

  // Load from localStorage on mount or when product changes
  useEffect(() => {
    if (!currentProductId) {
      setEpicsState([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const stored = localStorage.getItem(getStorageKey(currentProductId));
      if (stored) {
        const parsedEpics = JSON.parse(stored);
        if (parsedEpics.length > 0) {
          setEpicsState(parsedEpics);
        } else {
          // Storage is empty, seed with initial data
          const seedData = getSeedData(currentProductId);
          setEpicsState(seedData);
        }
      } else {
        // No storage found, seed with initial data
        const seedData = getSeedData(currentProductId);
        setEpicsState(seedData);
      }
    } catch (error) {
      console.error("Failed to load epics from storage:", error);
      const seedData = getSeedData(currentProductId);
      setEpicsState(seedData);
    }
    setSelectedEpic(null);
    setIsLoading(false);
  }, [currentProductId]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoading && currentProductId) {
      localStorage.setItem(getStorageKey(currentProductId), JSON.stringify(epics));
    }
  }, [epics, isLoading, currentProductId]);

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
    if (!currentProductId) return;
    
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
        productId: currentProductId,
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
  }, [currentProductId]);

  const clearAllData = useCallback(() => {
    setEpicsState([]);
    setSelectedEpic(null);
    if (currentProductId) {
      localStorage.removeItem(getStorageKey(currentProductId));
    }
  }, [currentProductId]);

  return (
    <EpicContext.Provider
      value={{
        epics,
        selectedEpic,
        isLoading,
        currentProductId,
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
