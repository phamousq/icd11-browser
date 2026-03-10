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
