# ICD-11 Learning Browser

A web application for learning and exploring the ICD-11 (International Classification of Diseases, 11th Revision) classification system. Built with React, TypeScript, and Vite.

## Features

- **Search** - Search ICD-11 diagnoses with debounced API calls
- **Browse** - View diagnosis details including code, title, fully specified name, synonyms, and exclusions
- **Postcoordination** - Form-based module selection to add details to base diagnoses
- **Plain English** - All text displayed in understandable English
- **Color-coded UI** - Blue for base diagnoses, green for postcoordination modules

## Prerequisites

- Node.js 18+
- PNPM (recommended)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root:
   ```bash
   VITE_CLIENT_ID=your_client_id
   VITE_CLIENT_SECRET=your_client_secret
   ```

   Get credentials from: https://icdapihome2-eme0b9bdf4fafkbg.northeurope-01.azurewebsites.net/icdapi

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open http://localhost:3000 in your browser

## Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── api/
│   ├── config.ts        # API configuration
│   └── icdApi.ts       # API calls and token management
├── components/
│   ├── DiagnosisDetail/
│   ├── Layout/
│   ├── Postcoordination/
│   ├── ResultsList/
│   └── SearchBar/
├── context/
│   └── AppContext.tsx  # Global state management
├── hooks/
│   └── useDebounce.ts  # Debounce hook
├── types/
│   └── index.ts        # TypeScript interfaces
├── App.tsx
└── main.tsx
```

## API

The application uses the WHO ICD-11 API:
- Authentication: OAuth2 client credentials
- Base URL: https://id.who.int/icd
- Version: 2026-01

## License

ISC
