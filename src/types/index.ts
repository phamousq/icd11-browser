export interface Diagnosis {
  id: string;
  code: string;
  title: string;
  stemId: string;
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
  parent?: string;
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

export interface ApiError {
  message: string;
  status?: number;
}
