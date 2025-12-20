import { createContext, useContext } from "react";

const StoryNamespaceContext = createContext<string>("default");

export function StoryNamespaceProvider({
  namespace,
  children
}: {
  namespace: string;
  children: React.ReactNode;
}) {
  return (
    <StoryNamespaceContext.Provider value={namespace}>
      {children}
    </StoryNamespaceContext.Provider>
  );
}

export function useStoryNamespace() {
  return useContext(StoryNamespaceContext);
}

