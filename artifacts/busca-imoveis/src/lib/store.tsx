import { createContext, useContext, useState, ReactNode } from "react";
import type { SearchFilters, SearchResults } from "@workspace/api-client-react";

interface SearchState {
  filters: Partial<SearchFilters>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  results: SearchResults | null;
  setResults: (results: SearchResults | null) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  searchStatus: string;
  setSearchStatus: (status: string) => void;
}

const SearchContext = createContext<SearchState | undefined>(undefined);

const DEFAULT_FILTERS: Partial<SearchFilters> = {
  operationType: "venda",
  propertyType: "apartamento",
  city: "",
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Partial<SearchFilters>>(DEFAULT_FILTERS);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");

  return (
    <SearchContext.Provider 
      value={{ 
        filters, 
        setFilters, 
        results, 
        setResults,
        isSearching,
        setIsSearching,
        searchStatus,
        setSearchStatus
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchStore() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchStore must be used within a SearchProvider");
  }
  return context;
}
