import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Diagnosis, DiagnosisDetail, PostcoordinationModule, PostcoordinationSelection } from '../types';

interface AppState {
  searchQuery: string;
  searchResults: Diagnosis[];
  selectedDiagnosis: DiagnosisDetail | null;
  postcoordinationModules: PostcoordinationModule[];
  postcoordinationSelections: PostcoordinationSelection[];
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Diagnosis[]) => void;
  setSelectedDiagnosis: (diagnosis: DiagnosisDetail | null) => void;
  setPostcoordinationModules: (modules: PostcoordinationModule[]) => void;
  addPostcoordinationSelection: (selection: PostcoordinationSelection) => void;
  removePostcoordinationSelection: (moduleId: string) => void;
  clearPostcoordinationSelections: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    searchQuery: '',
    searchResults: [],
    selectedDiagnosis: null,
    postcoordinationModules: [],
    postcoordinationSelections: [],
    isLoading: false,
    error: null,
  });

  const setSearchQuery = useCallback((query: string) => setState(s => ({ ...s, searchQuery: query })), []);
  const setSearchResults = useCallback((results: Diagnosis[]) => setState(s => ({ ...s, searchResults: results })), []);
  const setSelectedDiagnosis = useCallback((diagnosis: DiagnosisDetail | null) => setState(s => ({ ...s, selectedDiagnosis: diagnosis })), []);
  const setPostcoordinationModules = useCallback((modules: PostcoordinationModule[]) => setState(s => ({ ...s, postcoordinationModules: modules })), []);
  const addPostcoordinationSelection = useCallback((selection: PostcoordinationSelection) => setState(s => ({ 
    ...s, 
    postcoordinationSelections: [...s.postcoordinationSelections.filter(p => p.moduleId !== selection.moduleId), selection] 
  })), []);
  const removePostcoordinationSelection = useCallback((moduleId: string) => setState(s => ({ 
    ...s, 
    postcoordinationSelections: s.postcoordinationSelections.filter(p => p.moduleId !== moduleId) 
  })), []);
  const clearPostcoordinationSelections = useCallback(() => setState(s => ({ 
    ...s, 
    postcoordinationSelections: [] 
  })), []);
  const setIsLoading = useCallback((loading: boolean) => setState(s => ({ ...s, isLoading: loading })), []);
  const setError = useCallback((error: string | null) => setState(s => ({ ...s, error })), []);
  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  return (
    <AppContext.Provider value={{
      ...state,
      setSearchQuery,
      setSearchResults,
      setSelectedDiagnosis,
      setPostcoordinationModules,
      addPostcoordinationSelection,
      removePostcoordinationSelection,
      clearPostcoordinationSelections,
      setIsLoading,
      setError,
      clearError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
