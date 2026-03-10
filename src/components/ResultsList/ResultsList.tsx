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
