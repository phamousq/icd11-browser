import { useApp } from '../../context/AppContext';
import type { PostcoordinationModule, PostcoordinationValue } from '../../types';

export function ModuleSelector() {
  const { postcoordinationModules, postcoordinationSelections, addPostcoordinationSelection, removePostcoordinationSelection } = useApp();

  function handleChange(moduleId: string, valueId: string, label: string) {
    if (!valueId) {
      removePostcoordinationSelection(moduleId);
      return;
    }
    addPostcoordinationSelection({ moduleId, valueId, label });
  }

  return (
    <div className="module-selector">
      {postcoordinationModules.map((module: PostcoordinationModule) => {
        const currentSelection = postcoordinationSelections.find(s => s.moduleId === module.id);
        
        return (
          <div key={module.id} className="module-item">
            <label className="module-label">
              {module.title}
              {module.description && <span className="module-description">{module.description}</span>}
            </label>
            <select
              className="module-select"
              value={currentSelection?.valueId || ''}
              onChange={(e) => handleChange(module.id, e.target.value, e.target.options[e.target.selectedIndex]?.text || '')}
            >
              <option value="">Select...</option>
              {module.allowedValues?.map((val: PostcoordinationValue) => (
                <option key={val.value} value={val.value}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
