"use client";

import { createContext, useContext, ReactNode } from "react";

export type AppMode = "editor" | "preview";

interface ModeContextType {
  mode: AppMode;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

interface ModeProviderProps {
  children: ReactNode;
  mode: AppMode;
}

export function ModeProvider({ children, mode }: ModeProviderProps) {
  return (
    <ModeContext.Provider value={{ mode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextType {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}