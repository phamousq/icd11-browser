# ICD-11 Learning Browser Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React web app for learning ICD-11 with search, browse, and form-based postcoordination features.

**Architecture:** React SPA with Vite + TypeScript. Clean separation between API layer, state management (React Context), and UI components. Always online, fetches from WHO ICD-11 API.

**Tech Stack:** React 18, Vite, TypeScript, PNPM

---

## Chunk 1: Project Setup

### Task 1: Initialize React + Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "icd11-browser",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ICD-11 Learning Browser</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create src/main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: Create src/App.tsx**

```typescript
function App() {
  return (
    <div className="app">
      <h1>ICD-11 Learning Browser</h1>
    </div>
  )
}

export default App
```

- [ ] **Step 8: Create src/index.css**

```css
:root {
  --color-base: #2563EB;
  --color-postcoord: #16A34A;
  --color-active: #7C3AED;
  --color-error: #DC2626;
  --color-bg: #F9FAFB;
  --color-text: #1F2937;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
}

.app {
  min-height: 100vh;
}
```

- [ ] **Step 9: Install dependencies**

Run: `pnpm install`
Expected: Dependencies installed successfully

- [ ] **Step 10: Test dev server**

Run: `pnpm dev`
Expected: Browser opens with "ICD-11 Learning Browser" heading

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json index.html src/
git commit -m "chore: initialize React + Vite project"
```

---

## Chunk 2: API Layer

### Task 2: Create API Configuration and Types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/api/config.ts`
- Create: `src/api/icdApi.ts`

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export interface Diagnosis {
  id: string;
  code: string;
  title: string;
  description?: string;
  parentId?: string;
  childCount?: number;
}

export interface SearchResult {
  destination?: string;
  result?: Diagnosis[];
}

export interface DiagnosisDetail extends Diagnosis {
  inclusion?: string[];
  exclusion?: string[];
  children?: Diagnosis[];
  postcoordination?: PostcoordinationModule[];
}

export interface PostcoordinationModule {
  id: string;
  title: string;
  description?: string;
  allowedValues?: PostcoordinationValue[];
}

export interface PostcoordinationValue {
  value: string;
  label: string;
}

export interface PostcoordinationSelection {
  moduleId: string;
  valueId: string;
  label: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
```

- [ ] **Step 2: Create src/api/config.ts**

```typescript
export const CONFIG = {
  apiBaseUrl: 'https://id.who.int/icd',
  authUrl: 'https://icdaccessmanagement.who.int/connect/token',
  clientId: '78eb48aa-354b-4c13-ae93-f2269e0c1af3_f7662863-4e32-457e-858d-51f0ce1b5069',
  clientSecret: '30NdmUUneiJYEZkd2UnvRljcMwQqT0JHD0x4ATK4VRI=',
  releaseVersion: '2026-01',
  apiVersion: 'v2',
};
```

- [ ] **Step 3: Create src/api/icdApi.ts**

```typescript
import { CONFIG } from './config';
import type { Diagnosis, SearchResult, DiagnosisDetail, PostcoordinationModule } from '../types';

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CONFIG.clientId,
    client_secret: CONFIG.clientSecret,
  });

  const response = await fetch(CONFIG.authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  return cachedToken;
}

function getHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${cachedToken}`,
    'API-Version': CONFIG.apiVersion,
    'Accept-Language': 'en',
  };
}

export async function searchDiagnoses(query: string): Promise<Diagnosis[]> {
  const token = await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/release/11/${CONFIG.releaseVersion}/mms/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedToken = null;
      return searchDiagnoses(query);
    }
    throw new Error(`Search failed: ${response.status}`);
  }

  const data: SearchResult = await response.json();
  return data.result || [];
}

export async function getDiagnosisDetail(id: string): Promise<DiagnosisDetail> {
  const token = await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/entity/${id}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedToken = null;
      return getDiagnosisDetail(id);
    }
    throw new Error(`Get detail failed: ${response.status}`);
  }

  return response.json();
}

export async function getPostcoordinationOptions(id: string): Promise<PostcoordinationModule[]> {
  const token = await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/entity/${id}/postcoordination`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedToken = null;
      return getPostcoordinationOptions(id);
    }
    throw new Error(`Get postcoordination failed: ${response.status}`);
  }

  const data = await response.json();
  return data.module || [];
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/api/config.ts src/api/icdApi.ts
git commit -m "feat: add API layer with token management and endpoints"
```

---

## Chunk 3: State Management

### Task 3: Create App Context

**Files:**
- Create: `src/context/AppContext.tsx`

- [ ] **Step 1: Create src/context/AppContext.tsx**

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
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

  const setSearchQuery = (query: string) => setState(s => ({ ...s, searchQuery: query }));
  const setSearchResults = (results: Diagnosis[]) => setState(s => ({ ...s, searchResults: results }));
  const setSelectedDiagnosis = (diagnosis: DiagnosisDetail | null) => setState(s => ({ ...s, selectedDiagnosis: diagnosis }));
  const setPostcoordinationModules = (modules: PostcoordinationModule[]) => setState(s => ({ ...s, postcoordinationModules: modules }));
  const addPostcoordinationSelection = (selection: PostcoordinationSelection) => setState(s => ({ 
    ...s, 
    postcoordinationSelections: [...s.postcoordinationSelections.filter(p => p.moduleId !== selection.moduleId), selection] 
  }));
  const removePostcoordinationSelection = (moduleId: string) => setState(s => ({ 
    ...s, 
    postcoordinationSelections: s.postcoordinationSelections.filter(p => p.moduleId !== moduleId) 
  }));
  const setIsLoading = (loading: boolean) => setState(s => ({ ...s, isLoading: loading }));
  const setError = (error: string | null) => setState(s => ({ ...s, error }));
  const clearError = () => setState(s => ({ ...s, error: null }));

  return (
    <AppContext.Provider value={{
      ...state,
      setSearchQuery,
      setSearchResults,
      setSelectedDiagnosis,
      setPostcoordinationModules,
      addPostcoordinationSelection,
      removePostcoordinationSelection,
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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: add AppContext for state management"
```

---

## Chunk 4: Components - Layout

### Task 4: Create Layout Components

**Files:**
- Create: `src/components/Layout/Layout.tsx`
- Create: `src/components/Layout/Layout.css`

- [ ] **Step 1: Create src/components/Layout/Layout.tsx**

```typescript
import { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function Layout({ sidebar, children }: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        {sidebar}
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/Layout/Layout.css**

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout/Layout.tsx src/components/Layout/Layout.css
git commit -m "feat: add Layout component"
```

---

## Chunk 5: Components - Search

### Task 5: Create SearchBar Component

**Files:**
- Create: `src/hooks/useDebounce.ts`
- Create: `src/components/SearchBar/SearchBar.tsx`
- Create: `src/components/SearchBar/SearchBar.css`

- [ ] **Step 1: Create src/hooks/useDebounce.ts**

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

- [ ] **Step 2: Create src/components/SearchBar/SearchBar.tsx**

```typescript
import { useState, useEffect, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { searchDiagnoses } from '../../api/icdApi';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchBar.css';

export function SearchBar() {
  const { setSearchResults, setIsLoading, setError, clearError } = useApp();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;

    async function performSearch() {
      clearError();
      setIsLoading(true);
      try {
        const results = await searchDiagnoses(debouncedQuery);
        if (!cancelled) {
          setSearchResults(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Search failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, setSearchResults, setIsLoading, setError, clearError]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ICD-11 diagnoses..."
        className="search-input"
      />
    </form>
  );
}
```

- [ ] **Step 3: Create src/components/SearchBar/SearchBar.css**

```css
.search-bar {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: var(--color-base);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useDebounce.ts src/components/SearchBar/SearchBar.tsx src/components/SearchBar/SearchBar.css
git commit -m "feat: add SearchBar with debounced API calls"
```

---

## Chunk 6: Components - Results List

### Task 6: Create ResultsList Component

**Files:**
- Create: `src/components/ResultsList/ResultsList.tsx`
- Create: `src/components/ResultsList/ResultsList.css`

- [ ] **Step 1: Create src/components/ResultsList/ResultsList.tsx**

```typescript
import { useApp } from '../../context/AppContext';
import { getDiagnosisDetail, getPostcoordinationOptions } from '../../api/icdApi';
import type { DiagnosisDetail } from '../../types';
import './ResultsList.css';

export function ResultsList() {
  const { searchResults, selectedDiagnosis, setSelectedDiagnosis, setPostcoordinationModules, setIsLoading, setError } = useApp();

  async function handleSelect(diagnosis: DiagnosisDetail) {
    setIsLoading(true);
    try {
      const detail = await getDiagnosisDetail(diagnosis.id);
      setSelectedDiagnosis(detail);
      
      // Fetch postcoordination options
      try {
        const modules = await getPostcoordinationOptions(diagnosis.id);
        setPostcoordinationModules(modules);
      } catch {
        // Some diagnoses don't have postcoordination
        setPostcoordinationModules([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setIsLoading(false);
    }
  }

  if (searchResults.length === 0) {
    return (
      <div className="results-empty">
        <p>Search for ICD-11 diagnoses to get started</p>
      </div>
    );
  }

  return (
    <div className="results-list">
      {searchResults.map((result) => (
        <div
          key={result.id}
          className={`result-item ${selectedDiagnosis?.id === result.id ? 'selected' : ''}`}
          onClick={() => handleSelect(result)}
        >
          <span className="result-code">{result.code}</span>
          <span className="result-title">{result.title}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ResultsList/ResultsList.css**

```css
.results-list {
  flex: 1;
  overflow-y: auto;
}

.results-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-secondary);
}

.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.15s;
}

.result-item:hover {
  background-color: var(--color-bg);
}

.result-item.selected {
  background-color: rgba(37, 99, 235, 0.08);
  border-left: 3px solid var(--color-base);
}

.result-code {
  display: block;
  font-family: monospace;
  font-size: 14px;
  color: var(--color-base);
  font-weight: 600;
}

.result-title {
  display: block;
  font-size: 14px;
  color: var(--color-text);
  margin-top: 4px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultsList/ResultsList.tsx src/components/ResultsList/ResultsList.css
git commit -m "feat: add ResultsList component"
```

---

## Chunk 7: Components - Diagnosis Detail

### Task 7: Create DiagnosisDetail Component

**Files:**
- Create: `src/components/DiagnosisDetail/DiagnosisDetail.tsx`
- Create: `src/components/DiagnosisDetail/DiagnosisDetail.css`

- [ ] **Step 1: Create src/components/DiagnosisDetail/DiagnosisDetail.tsx**

```typescript
import { useApp } from '../../context/AppContext';
import './DiagnosisDetail.css';

export function DiagnosisDetail() {
  const { selectedDiagnosis } = useApp();

  if (!selectedDiagnosis) {
    return (
      <div className="diagnosis-detail-empty">
        <h2>Welcome to ICD-11 Learning Browser</h2>
        <p>Search for a diagnosis on the left to see details and explore postcoordination options.</p>
      </div>
    );
  }

  return (
    <div className="diagnosis-detail">
      <header className="diagnosis-header">
        <span className="diagnosis-code">{selectedDiagnosis.code}</span>
        <h1 className="diagnosis-title">{selectedDiagnosis.title}</h1>
      </header>

      {selectedDiagnosis.description && (
        <section className="diagnosis-section">
          <h2>Description</h2>
          <p>{selectedDiagnosis.description}</p>
        </section>
      )}

      {selectedDiagnosis.inclusion && selectedDiagnosis.inclusion.length > 0 && (
        <section className="diagnosis-section">
          <h2>Includes</h2>
          <ul>
            {selectedDiagnosis.inclusion.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {selectedDiagnosis.exclusion && selectedDiagnosis.exclusion.length > 0 && (
        <section className="diagnosis-section">
          <h2>Excludes</h2>
          <ul>
            {selectedDiagnosis.exclusion.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/DiagnosisDetail/DiagnosisDetail.css**

```css
.diagnosis-detail {
  max-width: 800px;
}

.diagnosis-detail-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-secondary);
}

.diagnosis-detail-empty h2 {
  color: var(--color-text);
  margin-bottom: 12px;
}

.diagnosis-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.diagnosis-code {
  display: inline-block;
  font-family: monospace;
  font-size: 18px;
  color: var(--color-base);
  font-weight: 600;
  background: rgba(37, 99, 235, 0.1);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.diagnosis-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
}

.diagnosis-section {
  margin-bottom: 24px;
}

.diagnosis-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.diagnosis-section p {
  font-size: 16px;
  line-height: 1.7;
}

.diagnosis-section ul {
  list-style: disc;
  padding-left: 24px;
}

.diagnosis-section li {
  margin-bottom: 4px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DiagnosisDetail/DiagnosisDetail.tsx src/components/DiagnosisDetail/DiagnosisDetail.css
git commit -m "feat: add DiagnosisDetail component"
```

---

## Chunk 8: Components - Postcoordination

### Task 8: Create Postcoordination Components

**Files:**
- Create: `src/components/Postcoordination/Postcoordination.tsx`
- Create: `src/components/Postcoordination/Postcoordination.css`
- Create: `src/components/Postcoordination/Preview.tsx`
- Create: `src/components/Postcoordination/ModuleSelector.tsx`

- [ ] **Step 1: Create src/components/Postcoordination/Postcoordination.tsx**

```typescript
import { useApp } from '../../context/AppContext';
import { ModuleSelector } from './ModuleSelector';
import { Preview } from './Preview';
import './Postcoordination.css';

export function Postcoordination() {
  const { selectedDiagnosis, postcoordinationModules } = useApp();

  if (!selectedDiagnosis) {
    return null;
  }

  return (
    <div className="postcoordination">
      <header className="postcoordination-header">
        <h2>Postcoordination</h2>
        <p>Add details to your diagnosis using the options below.</p>
      </header>

      {postcoordinationModules.length > 0 ? (
        <>
          <ModuleSelector />
          <Preview />
        </>
      ) : (
        <p className="no-postcoordination">
          No postcoordination options available for this diagnosis.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/Postcoordination/Postcoordination.css**

```css
.postcoordination {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.postcoordination-header {
  margin-bottom: 20px;
}

.postcoordination-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-postcoord);
  margin-bottom: 4px;
}

.postcoordination-header p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.no-postcoordination {
  padding: 16px;
  background: var(--color-bg);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
}
```

- [ ] **Step 3: Create src/components/Postcoordination/ModuleSelector.tsx**

```typescript
import { useApp } from '../../context/AppContext';
import type { PostcoordinationModule, PostcoordinationValue } from '../../types';

export function ModuleSelector() {
  const { postcoordinationModules, postcoordinationSelections, addPostcoordinationSelection, removePostcoordinationSelection } = useApp();

  function handleChange(moduleId: string, valueId: string, label: string) {
    if (!valueId) {
      removePostcoordinationSelection(moduleId);
      return;
    }
    addPostcoordinationSelection({ moduleId, valueId, label });
  }

  return (
    <div className="module-selector">
      {postcoordinationModules.map((module: PostcoordinationModule) => {
        const currentSelection = postcoordinationSelections.find(s => s.moduleId === module.id);
        
        return (
          <div key={module.id} className="module-item">
            <label className="module-label">
              {module.title}
              {module.description && <span className="module-description">{module.description}</span>}
            </label>
            <select
              className="module-select"
              value={currentSelection?.valueId || ''}
              onChange={(e) => handleChange(module.id, e.target.value, e.target.options[e.target.selectedIndex]?.text || '')}
            >
              <option value="">Select...</option>
              {module.allowedValues?.map((val: PostcoordinationValue) => (
                <option key={val.value} value={val.value}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create src/components/Postcoordination/Preview.tsx**

```typescript
import { useApp } from '../../context/AppContext';

export function Preview() {
  const { selectedDiagnosis, postcoordinationSelections } = useApp();

  if (!selectedDiagnosis) return null;

  const selections = postcoordinationSelections.filter(s => s.valueId);

  if (selections.length === 0) {
    return null;
  }

  const baseCode = selectedDiagnosis.code;
  const postcoordCodes = selections.map(s => s.valueId).join(' + ');
  const combinedCode = `${baseCode}${postcoordCodes ? ` + ${postcoordCodes}` : ''}`;
  
  const plainEnglish = [
    selectedDiagnosis.title,
    ...selections.map(s => s.label)
  ].join(', ');

  return (
    <div className="preview">
      <h3>Combined Code</h3>
      <code className="preview-code">{combinedCode}</code>
      
      <h3>Plain English</h3>
      <p className="preview-text">{plainEnglish}</p>
    </div>
  );
}
```

- [ ] **Step 5: Add Preview styles to Postcoordination.css (append)**

```css
.module-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.module-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.module-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-postcoord);
}

.module-description {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: normal;
}

.module-select {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.module-select:focus {
  outline: none;
  border-color: var(--color-postcoord);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.preview {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.preview h3 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.preview-code {
  display: block;
  font-family: monospace;
  font-size: 18px;
  color: var(--color-text);
  background: var(--color-bg);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.preview-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/Postcoordination/
git commit -m "feat: add Postcoordination components with form-based module selection"
```

---

## Chunk 9: App Assembly

### Task 9: Update App.tsx to Use Components

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.css`

- [ ] **Step 1: Update src/App.tsx**

```typescript
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout/Layout';
import { SearchBar } from './components/SearchBar/SearchBar';
import { ResultsList } from './components/ResultsList/ResultsList';
import { DiagnosisDetail } from './components/DiagnosisDetail/DiagnosisDetail';
import { Postcoordination } from './components/Postcoordination/Postcoordination';
import './App.css';

function AppContent() {
  const { error, clearError, isLoading } = useApp();

  const sidebar = (
    <>
      <SearchBar />
      <ResultsList />
    </>
  );

  return (
    <Layout sidebar={sidebar}>
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      {isLoading && <div className="loading-bar">Loading...</div>}
      <DiagnosisDetail />
      <Postcoordination />
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
```

- [ ] **Step 2: Create src/App.css**

```css
.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--color-error);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--color-error);
}

.error-banner button {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  text-decoration: underline;
}

.loading-bar {
  padding: 8px 16px;
  background: var(--color-bg);
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: Test the application**

Run: `pnpm dev`
Expected: App loads with search bar on left, welcome message on right. Search for "diabetes" should show results.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: assemble all components in App"
```

---

## Chunk 10: Build Verification

### Task 10: Build and Verify

- [ ] **Step 1: Run production build**

Run: `pnpm build`
Expected: Build completes without errors

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: complete ICD-11 Learning Browser implementation"
```

---

## Summary

This plan creates a complete ICD-11 Learning Browser with:

1. **Project Setup** - React + Vite + TypeScript
2. **API Layer** - Token management, search, detail, postcoordination endpoints
3. **State Management** - React Context for global state
4. **Search** - Debounced search with loading states
5. **Results List** - Clickable list with selection highlighting
6. **Diagnosis Detail** - Full details with descriptions, inclusions, exclusions
7. **Postcoordination** - Form-based module selection with preview
8. **Color Coding** - Blue for base, green for postcoordination, purple for active states

All components follow the design spec with plain English text and color-coded UI for ease of viewing.
