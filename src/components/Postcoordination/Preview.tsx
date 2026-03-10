import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function Preview() {
  const { selectedDiagnosis, postcoordinationSelections } = useApp();
  const [copied, setCopied] = useState(false);

  if (!selectedDiagnosis) return null;

  const selections = postcoordinationSelections.filter(s => s.valueId);

  if (selections.length === 0) {
    return null;
  }

  const stemCode = selectedDiagnosis.code;
  const extensions = selections.map(s => s.valueId);
  
  const clusterCode = extensions.length > 0 
    ? `${stemCode}&${extensions.join('&')}`
    : stemCode;
  
  const formattedCode = extensions.length > 0 
    ? `${stemCode} & ${extensions.join(' & ')}`
    : stemCode;

  const plainEnglish = [
    selectedDiagnosis.title,
    ...selections.map(s => `with ${s.label}`)
  ].join(', ');

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(clusterCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="preview">
      <div className="preview-header">
        <h3>Cluster Code</h3>
      </div>
      
      <code 
        className={`preview-code ${copied ? 'copied' : ''}`}
        onClick={copyCode}
        title="Click to copy"
      >
        <span className="code-text">{formattedCode}</span>
        <span className="copy-feedback">
          {copied ? '✓ Copied!' : 'Click to copy'}
        </span>
      </code>
      
      <div className="preview-english">
        <h3>Code Meaning</h3>
        <p className="preview-text">{plainEnglish}</p>
      </div>

      <div className="preview-breakdown">
        <h3>Code Breakdown</h3>
        <div className="breakdown-items">
          <div className="breakdown-item stem">
            <span className="breakdown-label">Stem Code</span>
            <code>{stemCode}</code>
            <span className="breakdown-desc">{selectedDiagnosis.title}</span>
          </div>
          {selections.map((selection, index) => (
            <div key={index} className="breakdown-item extension">
              <span className="breakdown-label">Extension {index + 1}</span>
              <code>{selection.valueId}</code>
              <span className="breakdown-desc">{selection.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cluster-syntax-note">
        <p><strong>ICD-11 Cluster Syntax:</strong> Stem codes are always listed first, followed by extension codes separated by ampersand (&amp;). Multiple stem codes are separated by forward slash (/).</p>
      </div>
    </div>
  );
}
