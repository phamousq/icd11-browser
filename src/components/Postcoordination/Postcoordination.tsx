import { useApp } from '../../context/AppContext';
import { ModuleSelector } from './ModuleSelector';
import { Preview } from './Preview';
import './Postcoordination.css';

export function Postcoordination() {
  const { selectedDiagnosis, postcoordinationModules } = useApp();

  if (!selectedDiagnosis) {
    return null;
  }

  return (
    <div className="postcoordination">
      <header className="postcoordination-header">
        <h2>Postcoordination</h2>
        <p>Add details to your diagnosis using the options below.</p>
      </header>

      {postcoordinationModules.length > 0 ? (
        <>
          <ModuleSelector />
          <Preview />
        </>
      ) : (
        <p className="no-postcoordination">
          No postcoordination options available for this diagnosis.
        </p>
      )}
    </div>
  );
}
