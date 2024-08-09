import { createContext, h, JSX } from "preact";
import { useState } from "preact/hooks";
import React from "preact/compat";

export interface SearchContextState {
  isSearchActive: boolean;
  setIsSearchActive: (isSearchActive: boolean) => void;
  currentSearchTerm: string;
  setCurrentSearchTerm: (currentSearchTerm: string) => void;
}

export const SearchContext = createContext<SearchContextState>(
  {} as SearchContextState
);

export const SearchContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  return (
    <SearchContext.Provider
      value={{
        isSearchActive,
        setIsSearchActive,
        currentSearchTerm,
        setCurrentSearchTerm,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
