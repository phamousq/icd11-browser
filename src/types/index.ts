export interface Diagnosis {
  id: string;
  code: string;
  title: string;
  description?: string;
  parentId?: string;
  childCount?: number;
}

export interface SearchResult {
  destination?: string;
  result?: Diagnosis[];
}

export interface DiagnosisDetail extends Diagnosis {
  inclusion?: string[];
  exclusion?: string[];
  children?: Diagnosis[];
  postcoordination?: PostcoordinationModule[];
}

export interface PostcoordinationModule {
  id: string;
  title: string;
  description?: string;
  allowedValues?: PostcoordinationValue[];
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

export interface ApiError {
  message: string;
  status?: number;
}
