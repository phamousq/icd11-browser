import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout/Layout';
import { SearchBar } from './components/SearchBar/SearchBar';
import { ResultsList } from './components/ResultsList/ResultsList';
import { DiagnosisDetail } from './components/DiagnosisDetail/DiagnosisDetail';
import { Postcoordination } from './components/Postcoordination/Postcoordination';
import { ChapterNav } from './components/ChapterNav/ChapterNav';
import './App.css';

function AppContent() {
  const { error, clearError, isLoading } = useApp();

  const sidebar = (
    <>
      <SearchBar />
      <ResultsList />
      <ChapterNav variant="sidebar" />
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
