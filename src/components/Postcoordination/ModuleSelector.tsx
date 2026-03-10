import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { PostcoordinationModule, PostcoordinationValue } from '../../types';

interface GroupedModule {
  axisName: string;
  module: PostcoordinationModule;
}

export function ModuleSelector() {
  const { postcoordinationModules, postcoordinationSelections, addPostcoordinationSelection, removePostcoordinationSelection } = useApp();

  // Group modules by axis - only show one dropdown per axis
  const groupedModules = useMemo(() => {
    const groups: GroupedModule[] = [];
    const seenAxes = new Set<string>();
    
    for (const module of postcoordinationModules) {
      // Normalize axis name for grouping (handle variations)
      const normalizedAxis = module.axisName.toLowerCase().replace(/has/g, '').trim();
      
      if (!seenAxes.has(normalizedAxis)) {
        seenAxes.add(normalizedAxis);
        groups.push({ axisName: normalizedAxis, module });
      }
    }
    
    return groups;
  }, [postcoordinationModules]);

  function handleChange(moduleId: string, valueId: string, label: string) {
    if (!valueId) {
      removePostcoordinationSelection(moduleId);
      return;
    }
    addPostcoordinationSelection({ moduleId, valueId, label });
  }

  // Get selected values grouped by axis for conflict detection
  const selectionsByAxis = useMemo(() => {
    const byAxis: Record<string, string[]> = {};
    
    for (const selection of postcoordinationSelections) {
      const module = postcoordinationModules.find(m => m.id === selection.moduleId);
      if (module) {
        const axis = module.axisName.toLowerCase().replace(/has/g, '').trim();
        if (!byAxis[axis]) byAxis[axis] = [];
        byAxis[axis].push(selection.valueId);
      }
    }
    
    return byAxis;
  }, [postcoordinationSelections, postcoordinationModules]);

  // Check if a value is incompatible with current selections
  function isIncompatible(moduleId: string, valueId: string): boolean {
    const module = postcoordinationModules.find(m => m.id === moduleId);
    if (!module) return false;
    
    const axis = module.axisName.toLowerCase().replace(/has/g, '').trim();
    
    // Check for mutual exclusivity based on known conflicting pairs
    // These are common ICD-11 extension code conflicts
    const conflictingPatterns: Record<string, string[]> = {
      'simple': ['open'],
      'closed': ['open'],
      'open': ['simple', 'closed'],
      'left': ['right', 'bilateral'],
      'right': ['left', 'bilateral'],
      'bilateral': ['left', 'right'],
    };
    
    const valueLower = valueId.toLowerCase();
    const axisLower = axis.toLowerCase();
    
    // Check if any currently selected value conflicts with the new value
    for (const [pattern, conflicts] of Object.entries(conflictingPatterns)) {
      if (valueLower.includes(pattern)) {
        for (const conflict of conflicts) {
          for (const selectedValue of selectionsByAxis[axis] || []) {
            if (selectedValue.toLowerCase().includes(conflict)) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }

  // Get warning message for incompatible selection
  function getIncompatibleWarning(moduleId: string, valueId: string): string | null {
    const module = postcoordinationModules.find(m => m.id === moduleId);
    if (!module) return null;
    
    const axis = module.axisName.toLowerCase().replace(/has/g, '').trim();
    const valueLower = valueId.toLowerCase();
    
    const warnings: Record<string, string> = {
      'simple': 'Cannot combine with Open fracture',
      'closed': 'Cannot combine with Open fracture', 
      'open': 'Cannot combine with Simple/Closed fracture',
    };
    
    for (const [pattern, warning] of Object.entries(warnings)) {
      if (valueLower.includes(pattern)) {
        // Check if there's a conflicting selection
        const selectedValues = selectionsByAxis[axis] || [];
        for (const selected of selectedValues) {
          if (selected.toLowerCase().includes(pattern === 'simple' || pattern === 'closed' ? 'open' : 'simple')) {
            return warning;
          }
        }
      }
    }
    
    return null;
  }

  return (
    <div className="module-selector">
      {groupedModules.map(({ axisName, module }) => {
        const currentSelection = postcoordinationSelections.find(s => s.moduleId === module.id);
        
        return (
          <div key={module.id} className="module-item">
            <label className="module-label">
              {module.title}
              {module.required && <span className="required-badge">Required</span>}
              {module.description && <span className="module-description">{module.description}</span>}
            </label>
            <select
              className="module-select"
              value={currentSelection?.valueId || ''}
              onChange={(e) => handleChange(module.id, e.target.value, e.target.options[e.target.selectedIndex]?.text || '')}
            >
              <option value="">Select...</option>
              {module.allowedValues?.map((val: PostcoordinationValue) => {
                const incompatible = isIncompatible(module.id, val.value);
                return (
                  <option 
                    key={val.value} 
                    value={val.value}
                    disabled={incompatible}
                  >
                    {val.label}{incompatible ? ' (incompatible)' : ''}
                  </option>
                );
              })}
            </select>
            {currentSelection && getIncompatibleWarning(module.id, currentSelection.valueId) && (
              <span className="incompatible-warning">
                ⚠️ {getIncompatibleWarning(module.id, currentSelection.valueId)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
