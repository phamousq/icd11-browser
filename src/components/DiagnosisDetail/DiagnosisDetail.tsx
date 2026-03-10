import { useApp } from '../../context/AppContext';
import './DiagnosisDetail.css';

function toString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const obj = value as { '@value'?: string; value?: string; label?: string };
    return obj['@value'] || obj.value || obj.label || JSON.stringify(value);
  }
  return String(value || '');
}

export function DiagnosisDetail() {
  const { selectedDiagnosis } = useApp();

  if (!selectedDiagnosis) {
    return (
      <div className="diagnosis-detail-empty">
        <h2>ICD-11 Learning Browser</h2>
        <p>Search for a diagnosis to view details and explore postcoordination options.</p>
      </div>
    );
  }

  const exclusions = selectedDiagnosis.exclusion?.map(toString).filter(Boolean) || [];
  const synonyms = selectedDiagnosis.synonym?.map(toString).filter(Boolean) || [];

  return (
    <div className="diagnosis-detail">
      <header className="diagnosis-header">
        <div className="icd-code-badge">
          <span className="icd-code">{selectedDiagnosis.code}</span>
        </div>
        <h1 className="diagnosis-title">{toString(selectedDiagnosis.title)}</h1>
        <p className="diagnosis-id">ID: {selectedDiagnosis.id}</p>
      </header>

      {selectedDiagnosis.fullySpecifiedName && (
        <section className="diagnosis-section">
          <h2>Fully Specified Name</h2>
          <p className="fully-specified">{toString(selectedDiagnosis.fullySpecifiedName)}</p>
        </section>
      )}

      {synonyms.length > 0 && (
        <section className="diagnosis-section">
          <h2>Synonyms</h2>
          <ul className="synonyms-list">
            {synonyms.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {exclusions.length > 0 && (
        <section className="diagnosis-section exclusions">
          <h2>Excludes</h2>
          <ul className="exclusions-list">
            {exclusions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
