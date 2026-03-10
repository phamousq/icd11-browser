# ICD-11 Learning Browser - Design Specification

**Date:** 2026-03-10  
**Status:** Approved  
**Tech Stack:** React + Vite + TypeScript + PNPM

---

## 1. Overview

A web application for learning and exploring the ICD-11 classification system. Users can search for diagnoses, browse the hierarchy, and build postcoordinated codes using a form-based interface. Designed for educational use with plain text, color-coded UI for ease of viewing.

---

## 2. Architecture

### 2.1 Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Package Manager:** PNPM
- **Styling:** CSS Modules or plain CSS with CSS variables

### 2.2 Project Structure

```
src/
├── api/
│   └── icdApi.ts          # Token management, API calls
├── components/
│   ├── SearchBar/         # Search input with suggestions
│   │   ├── SearchBar.tsx
│   │   └── SearchBar.css
│   ├── ResultsList/       # Search results display
│   │   ├── ResultsList.tsx
│   │   └── ResultsList.css
│   ├── DiagnosisDetail/   # Full diagnosis info
│   │   ├── DiagnosisDetail.tsx
│   │   └── DiagnosisDetail.css
│   ├── Postcoordination/  # Form-based postcoordination
│   │   ├── Postcoordination.tsx
│   │   ├── Postcoordination.css
│   │   ├── ModuleSelector.tsx
│   │   └── Preview.tsx
│   └── Layout/
│       ├── Layout.tsx
│       └── Layout.css
├── context/
│   └── AppContext.tsx     # Global state (search results, selected diagnosis, postcoordination)
├── types/
│   └── index.ts           # TypeScript interfaces
├── hooks/
│   └── useDebounce.ts     # Debounce hook for search
├── utils/
│   └── formatCode.ts      # Format postcoordinated codes
├── App.tsx
├── App.css
└── main.tsx
```

---

## 3. Features

### 3.1 Search & Browse

- Search input with debounced API calls (300ms delay)
- Display results as a scrollable list
- Each result shows: title, code, brief description
- Click result to view full details
- Browse chapters/categories in a tree structure

### 3.2 Diagnosis Details

- Full title and code
- Complete description in plain English
- Parent category path (breadcrumb)
- Child categories (if any)
- List of available postcoordination modules

### 3.3 Postcoordination (Form-Based)

- User selects a base diagnosis from search
- App fetches available postcoordination modules from API
- Form displays available modules as dropdowns/inputs:
  - Severity
  - Body site
  - Laterality
  - Duration
  - Etc. (based on API response)
- Each module option updates the preview
- Preview shows combined code in plain English text

### 3.4 Authentication

- OAuth2 client credentials flow
- Fetch token on app load
- Store token in memory (not localStorage)
- Auto-refresh when token expires

---

## 4. API Integration

### 4.1 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://icdaccessmanagement.who.int/connect/token` | POST | OAuth2 token acquisition |
| `https://id.who.int/icd/release/11/{version}/mms/search` | GET | Search diagnoses |
| `https://id.who.int/icd/entity/{id}` | GET | Get diagnosis details |
| `https://id.who.int/icd/entity/{id}/children` | GET | Get child categories |
| `https://id.who.int/icd/entity/{id}/postcoordination` | GET | Get available postcoordination options |

### 4.2 Configuration

```typescript
const CONFIG = {
  apiBaseUrl: 'https://id.who.int/icd',
  authUrl: 'https://icdaccessmanagement.who.int/connect/token',
  clientId: '78eb48aa-354b-4c13-ae93-f2269e0c1af3_f7662863-4e32-457e-858d-51f0ce1b5069',
  clientSecret: '30NdmUUneiJYEZkd2UnvRljcMwQqT0JHD0x4ATK4VRI=',
  releaseVersion: '2026-01',
  apiVersion: 'v2',
};
```

### 4.3 Headers

```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'API-Version': 'v2',
  'Accept-Language': 'en',
};
```

---

## 5. UI/UX Design

### 5.1 Color Scheme

| Purpose | Color | Hex |
|---------|-------|-----|
| Base diagnosis | Blue | #2563EB |
| Postcoordination modules | Green | #16A34A |
| Selected/active | Purple | #7C3AED |
| Warnings/errors | Red | #DC2626 |
| Background | Light gray | #F9FAFB |
| Text | Dark gray | #1F2937 |
| Secondary text | Medium gray | #6B7280 |
| Border | Light border | #E5E7EB |

### 5.2 Layout

- **Left sidebar:** Search bar + results list (300px width)
- **Main area:** Diagnosis detail + postcoordination form
- **Responsive:** Stack vertically on mobile (< 768px)

### 5.3 Typography

- Font: System fonts (San Francisco on macOS, Segoe UI on Windows)
- Headings: Bold, larger size
- Body: Regular, 16px base
- Code: Monospace font

### 5.4 Plain English

All text should be in plain, understandable English. Avoid medical jargon where possible. When technical terms are necessary, provide brief explanations.

---

## 6. Error Handling

- **Network errors:** Show retry button with clear message
- **Invalid token:** Auto-retry with fresh token (max 1 retry)
- **No results:** "No diagnoses found for '[query]'"
- **API errors:** Display error message with details

---

## 7. Acceptance Criteria

1. User can search for diagnoses by keyword
2. Search results display with code, title, and description
3. Clicking a result shows full diagnosis details
4. User can select a diagnosis for postcoordination
5. Postcoordination form shows available modules from API
6. Selecting module options updates the preview
7. Preview displays combined code in plain English
8. Color coding helps distinguish base diagnosis from postcoordination
9. App handles errors gracefully with user-friendly messages
10. Token management works automatically

---

## 8. Future Considerations (Out of Scope)

- Offline mode / caching
- Quiz mode
- Flashcards
- User accounts / saved searches
- Export functionality
