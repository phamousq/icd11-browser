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
        console.error('Search error:', err);
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
