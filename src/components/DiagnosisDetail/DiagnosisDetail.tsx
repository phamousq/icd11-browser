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
        <h2>Welcome to ICD-11 Learning Browser</h2>
        <p>Search for a diagnosis on the left to see details and explore postcoordination options.</p>
      </div>
    );
  }

  const exclusions = selectedDiagnosis.exclusion?.map(toString).filter(Boolean) || [];
  const synonyms = selectedDiagnosis.synonym?.map(toString).filter(Boolean) || [];

  return (
    <div className="diagnosis-detail">
      <header className="diagnosis-header">
        <span className="diagnosis-code">{selectedDiagnosis.code}</span>
        <h1 className="diagnosis-title">{toString(selectedDiagnosis.title)}</h1>
      </header>

      {selectedDiagnosis.fullySpecifiedName && (
        <section className="diagnosis-section">
          <h2>Fully Specified Name</h2>
          <p>{toString(selectedDiagnosis.fullySpecifiedName)}</p>
        </section>
      )}

      {synonyms.length > 0 && (
        <section className="diagnosis-section">
          <h2>Synonyms</h2>
          <ul>
            {synonyms.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {exclusions.length > 0 && (
        <section className="diagnosis-section">
          <h2>Excludes</h2>
          <ul>
            {exclusions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
