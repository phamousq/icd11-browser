export interface Diagnosis {
  id: string;
  code: string;
  title: string;
  stemId: string;
  chapter?: string;
  block?: string;
  isLeaf?: boolean;
}

export interface SearchResult {
  destinationEntities: Diagnosis[];
  error?: string;
}

export interface DiagnosisDetail {
  id: string;
  code: string;
  title: string;
  stemId: string;
  fullySpecifiedName?: string;
  exclusion?: string[];
  synonym?: string[];
  parent?: string[];
  child?: string[];
  classKind?: string;
  chapter?: string;
  block?: string;
  relatedEntitiesInMaternalChapter?: string[];
  relatedEntitiesInPerinatalChapter?: string[];
  postcoordinationScale?: PostcoordinationScale[];
}

export interface PostcoordinationScale {
  '@id': string;
  axisName: string;
  requiredPostcoordination: string;
  allowMultipleValues: string;
  scaleEntity: string[];
}

export interface PostcoordinationModule {
  id: string;
  title: string;
  axisName: string;
  required: boolean;
  allowMultiple: boolean;
  allowedValues: PostcoordinationValue[];
}

export interface PostcoordinationValue {
  value: string;
  label: string;
}

export interface PostcoordinationSelection {
  moduleId: string;
  valueId: string;
  label: string;
}

export interface ChapterInfo {
  chapterCode: string;
  chapterTitle: string;
  blockCode?: string;
  blockTitle?: string;
}

export interface RelatedDiagnosis {
  id: string;
  code: string;
  title: string;
  relationship: 'parent' | 'child' | 'sibling' | 'chapter' | 'related';
}

export interface ApiError {
  message: string;
  status?: number;
}

// ICD-11 Chapter mapping
export const ICD_CHAPTERS: Record<string, string> = {
  '01': 'Certain infectious or parasitic diseases',
  '02': 'Neoplasms',
  '03': 'Diseases of the blood or blood-forming organs',
  '04': 'Diseases of the immune system',
  '05': 'Endocrine diseases',
  '06': 'Mental, behavioural or neurodevelopmental disorders',
  '07': 'Sleep-wake disorders',
  '08': 'Diseases of the nervous system',
  '09': 'Diseases of the visual system',
  '10': 'Diseases of the ear or mastoid process',
  '11': 'Diseases of the circulatory system',
  '12': 'Diseases of the respiratory system',
  '13': 'Diseases of the digestive system',
  '14': 'Diseases of the skin',
  '15': 'Diseases of the musculoskeletal system or connective tissue',
  '16': 'Diseases of the genitourinary system',
  '17': 'Conditions related to sexual health',
  '18': 'Pregnancy, childbirth or the puerperium',
  '19': 'Certain conditions originating in the perinatal period',
  '20': 'Developmental anomalies',
  '21': 'Symptoms, signs or clinical findings, not elsewhere classified',
  '22': 'Injury, poisoning or certain other consequences of external causes',
  '23': 'External causes of morbidity or mortality',
  '24': 'Factors influencing health status or contact with health services',
  '25': 'Codes for special purposes',
  '26': 'Traditional medicine',
  'V': 'Supplementary chapter traditional medicine',
  'X': 'Extension codes',
};
