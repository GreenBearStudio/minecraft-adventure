import { createContext, useContext, useState, useEffect } from "react";

type StoryFlags = Record<string, boolean>;

type StoryStateContextType = {
  flags: StoryFlags;
  setFlag: (key: string, value: boolean) => void;
  setNamespacedFlag: (ns: string, key: string, value: boolean) => void;
  resetNamespace: (ns: string) => void;
  resetAll: () => void;
};

const StoryStateContext = createContext<StoryStateContextType | null>(null);

export function StoryStateProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<StoryFlags>({});

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("storyFlags");
    if (stored) {
      try {
        setFlags(JSON.parse(stored));
      } catch {
        console.warn("Invalid storyFlags in localStorage");
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("storyFlags", JSON.stringify(flags));
  }, [flags]);

  const setFlag = (key: string, value: boolean) => {
    setFlags(prev => ({ ...prev, [key]: value }));
  };

  const setNamespacedFlag = (ns: string, key: string, value: boolean) => {
    const fullKey = `${ns}.${key}`;
    setFlags(prev => ({ ...prev, [fullKey]: value }));
  };

  const resetNamespace = (ns: string) => {
    setFlags(prev => {
      const updated: StoryFlags = {};
      for (const key in prev) {
        if (!key.startsWith(`${ns}.`)) updated[key] = prev[key];
      }
      return updated;
    });
  };

  const resetAll = () => {
    setFlags({});
    localStorage.removeItem("storyFlags");
  };

  return (
    <StoryStateContext.Provider
      value={{ flags, setFlag, setNamespacedFlag, resetNamespace, resetAll }}
    >
      {children}
    </StoryStateContext.Provider>
  );
}

export function useStoryState() {
  const ctx = useContext(StoryStateContext);
  if (!ctx) throw new Error("useStoryState must be used inside StoryStateProvider");
  return ctx;
}

