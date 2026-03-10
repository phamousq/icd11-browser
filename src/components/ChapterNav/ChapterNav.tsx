import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getAllRelatedDiagnoses, getChapterInfo } from '../../api/icdApi';
import type { RelatedDiagnosis, ChapterInfo } from '../../types';
import './ChapterNav.css';

interface ChapterNavProps {
  onSelectDiagnosis?: (id: string, code: string) => void;
  variant?: 'sidebar' | 'detail';
}

export function ChapterNav({ onSelectDiagnosis, variant = 'sidebar' }: ChapterNavProps) {
  const { selectedDiagnosis, setSelectedDiagnosis, setPostcoordinationModules, clearPostcoordinationSelections, setIsLoading, setError } = useApp();
  const [relatedDiagnoses, setRelatedDiagnoses] = useState<RelatedDiagnosis[]>([]);
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo | undefined>();
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    parents: true,
    children: true,
    chapter: true,
  });

  useEffect(() => {
    if (!selectedDiagnosis) {
      setRelatedDiagnoses([]);
      setChapterInfo(undefined);
      return;
    }

    const info = getChapterInfo(selectedDiagnosis.code);
    setChapterInfo(info);

    async function fetchRelated() {
      setIsLoadingRelated(true);
      try {
        const related = await getAllRelatedDiagnoses(selectedDiagnosis.id);
        setRelatedDiagnoses(related);
      } catch (err) {
        console.error('Failed to fetch related:', err);
      } finally {
        setIsLoadingRelated(false);
      }
    }

    fetchRelated();
  }, [selectedDiagnosis]);

  const handleSelectRelated = async (diagnosis: RelatedDiagnosis) => {
    if (onSelectDiagnosis) {
      onSelectDiagnosis(diagnosis.id, diagnosis.code);
      return;
    }
    
    // Default behavior: load the diagnosis
    setIsLoading(true);
    try {
      const { getDiagnosisDetail, getPostcoordinationOptions } = await import('../../api/icdApi');
      const detail = await getDiagnosisDetail(diagnosis.id);
      setSelectedDiagnosis(detail);
      clearPostcoordinationSelections();
      
      try {
        const modules = await getPostcoordinationOptions(diagnosis.id);
        setPostcoordinationModules(modules);
      } catch {
        setPostcoordinationModules([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagnosis');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const parents = relatedDiagnoses.filter(r => r.relationship === 'parent');
  const children = relatedDiagnoses.filter(r => r.relationship === 'child');
  const chapterRelated = relatedDiagnoses.filter(r => r.relationship === 'chapter');

  if (!selectedDiagnosis) {
    return null;
  }

  return (
    <div className={`chapter-nav chapter-nav-${variant}`}>
      {chapterInfo && (
        <div className="chapter-header">
          <div className="chapter-badge">
            <span className="chapter-number">Ch. {chapterInfo.chapterCode}</span>
            <span className="chapter-title">{chapterInfo.chapterTitle}</span>
          </div>
        </div>
      )}

      {isLoadingRelated ? (
        <div className="chapter-loading">Loading related diagnoses...</div>
      ) : relatedDiagnoses.length > 0 ? (
        <div className="related-sections">
          {parents.length > 0 && (
            <div className="related-section">
              <button 
                className="section-header"
                onClick={() => toggleSection('parents')}
              >
                <span className="section-icon">{expandedSections.parents ? '▼' : '▶'}</span>
                <span className="section-title">Parent Categories</span>
                <span className="section-count">({parents.length})</span>
              </button>
              {expandedSections.parents && (
                <ul className="related-list">
                  {parents.map((diagnosis) => (
                    <li key={diagnosis.id}>
                      <button 
                        className="related-item"
                        onClick={() => handleSelectRelated(diagnosis)}
                      >
                        <span className="related-code">{diagnosis.code}</span>
                        <span className="related-title">{diagnosis.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {children.length > 0 && (
            <div className="related-section">
              <button 
                className="section-header"
                onClick={() => toggleSection('children')}
              >
                <span className="section-icon">{expandedSections.children ? '▼' : '▶'}</span>
                <span className="section-title">More Specific</span>
                <span className="section-count">({children.length})</span>
              </button>
              {expandedSections.children && (
                <ul className="related-list">
                  {children.map((diagnosis) => (
                    <li key={diagnosis.id}>
                      <button 
                        className="related-item"
                        onClick={() => handleSelectRelated(diagnosis)}
                      >
                        <span className="related-code">{diagnosis.code}</span>
                        <span className="related-title">{diagnosis.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {chapterRelated.length > 0 && (
            <div className="related-section">
              <button 
                className="section-header"
                onClick={() => toggleSection('chapter')}
              >
                <span className="section-icon">{expandedSections.chapter ? '▼' : '▶'}</span>
                <span className="section-title">Same Chapter</span>
                <span className="section-count">({chapterRelated.length})</span>
              </button>
              {expandedSections.chapter && (
                <ul className="related-list">
                  {chapterRelated.map((diagnosis) => (
                    <li key={diagnosis.id}>
                      <button 
                        className="related-item"
                        onClick={() => handleSelectRelated(diagnosis)}
                      >
                        <span className="related-code">{diagnosis.code}</span>
                        <span className="related-title">{diagnosis.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="no-related">
          No related diagnoses found
        </div>
      )}
    </div>
  );
}
