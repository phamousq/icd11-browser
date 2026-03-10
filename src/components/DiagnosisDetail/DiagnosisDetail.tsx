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
