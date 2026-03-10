import { CONFIG } from './config';
import type { Diagnosis, SearchResult, DiagnosisDetail, PostcoordinationModule, ChapterInfo, RelatedDiagnosis } from '../types';
import { ICD_CHAPTERS } from '../types';

interface TokenData {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenData | null = null;
let tokenRequestPromise: Promise<string> | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  if (tokenRequestPromise) {
    return tokenRequestPromise;
  }

  tokenRequestPromise = fetchToken();
  return tokenRequestPromise;
}

async function fetchToken(): Promise<string> {
  if (!CONFIG.clientId || !CONFIG.clientSecret) {
    throw new Error('OAuth credentials not configured. Set VITE_CLIENT_ID and VITE_CLIENT_SECRET environment variables.');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CONFIG.clientId,
    client_secret: CONFIG.clientSecret,
  });

  const response = await fetch(CONFIG.authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorBody = await parseErrorResponse(response);
    throw new Error(`Auth failed: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const expiresIn = data.expires_in || 3600;
  
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (expiresIn * 1000),
  };
  
  tokenRequestPromise = null;
  return cachedToken.accessToken;
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.error_description || errorData.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

function getHeaders(): HeadersInit {
  const token = cachedToken?.accessToken;
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'API-Version': CONFIG.apiVersion,
    'Accept-Language': CONFIG.defaultLanguage,
  };
}

function clearToken(): void {
  cachedToken = null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function extractString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Handle { "@value": "..." } or { "label": { "@value": "..." } }
    if ('@value' in obj) {
      return String(obj['@value']);
    }
    if ('label' in obj && typeof obj.label === 'object') {
      const labelObj = obj.label as Record<string, unknown>;
      if ('@value' in labelObj) {
        return String(labelObj['@value']);
      }
    }
    if ('value' in obj) {
      return String(obj.value);
    }
    return JSON.stringify(value);
  }
  return String(value || '');
}

function extractStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(extractString).filter(Boolean);
  }
  if (value && typeof value === 'object') {
    return [extractString(value)].filter(Boolean);
  }
  return [];
}

function extractIdFromUrl(url: string): string {
  // Handle URLs like: http://id.who.int/icd/release/11/2026-01/mms/1697306310/other
  const match = url.match(/\/mms\/([^/]+)/);
  return match ? match[1] : url.split('/').pop() || url;
}

export async function searchDiagnoses(query: string): Promise<Diagnosis[]> {
  await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/${CONFIG.releaseId}/${CONFIG.releaseVersion}/mms/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      return searchDiagnoses(query);
    }
    const errorBody = await parseErrorResponse(response);
    throw new Error(`Search failed: ${response.status} - ${errorBody}`);
  }

  const data: SearchResult = await response.json();
  if (!data.destinationEntities) {
    return [];
  }

  return data.destinationEntities.map((entity) => ({
    id: entity.id,
    stemId: entity.stemId || entity.id,
    code: entity.theCode || '',
    title: stripHtml(extractString(entity.title)),
    chapter: entity.chapter,
    isLeaf: entity.isLeaf,
  }));
}

export async function getDiagnosisDetail(idOrUrl: string): Promise<DiagnosisDetail> {
  await getToken();
  
  const id = extractIdFromUrl(idOrUrl);
  const url = `${CONFIG.apiBaseUrl}/${CONFIG.releaseId}/${CONFIG.releaseVersion}/mms/${id}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      return getDiagnosisDetail(id);
    }
    const errorBody = await parseErrorResponse(response);
    throw new Error(`Get detail failed: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  
  return {
    id: data['@id'] || data.id || id,
    stemId: data['@id'] || id,
    code: data.code || '',
    title: extractString(data.title),
    fullySpecifiedName: extractString(data.fullySpecifiedName),
    exclusion: extractStrings(data.exclusion),
    synonym: extractStrings(data.synonym),
    parent: data.parent,
    child: data.child,
    classKind: data.classKind,
    chapter: extractChapterCode(data.code),
    block: extractBlockCode(data.code),
    relatedEntitiesInMaternalChapter: data.relatedEntitiesInMaternalChapter,
    relatedEntitiesInPerinatalChapter: data.relatedEntitiesInPerinatalChapter,
    postcoordinationScale: data.postcoordinationScale,
  };
}

export async function getPostcoordinationOptions(id: string): Promise<PostcoordinationModule[]> {
  const detail = await getDiagnosisDetail(id);
  
  if (!detail.postcoordinationScale || detail.postcoordinationScale.length === 0) {
    return [];
  }

  const modules: PostcoordinationModule[] = [];

  for (const scale of detail.postcoordinationScale) {
    const moduleId = extractIdFromUrl(scale['@id']);
    
    const allowedValuesRaw = await Promise.all(
      scale.scaleEntity.map(async (entityUrl) => {
        try {
          const entityDetail = await getDiagnosisDetail(extractIdFromUrl(entityUrl));
          return {
            value: extractIdFromUrl(entityUrl),
            label: entityDetail.title,
          };
        } catch {
          return {
            value: extractIdFromUrl(entityUrl),
            label: extractIdFromUrl(entityUrl),
          };
        }
      })
    );

    // Deduplicate by value
    const seen = new Set<string>();
    const allowedValues = allowedValuesRaw.filter(v => {
      if (seen.has(v.value)) return false;
      seen.add(v.value);
      return true;
    });

    // Use module index to ensure unique IDs if duplicates exist
    const uniqueModuleId = modules.length > 0 && modules.some(m => m.id === moduleId) 
      ? `${moduleId}_${modules.length}` 
      : moduleId;

    modules.push({
      id: uniqueModuleId,
      title: extractIdFromUrl(scale.axisName).replace('has', ''),
      axisName: scale.axisName,
      required: scale.requiredPostcoordination === 'true',
      allowMultiple: scale.allowMultipleValues === 'AllowAlways',
      allowedValues,
    });
  }

  return modules;
}

// Extract chapter code from ICD code (e.g., "5A11" -> "05")
function extractChapterCode(code: string): string | undefined {
  if (!code) return undefined;
  
  // Handle letter + numbers format (e.g., "5A11", "NC32")
  const match = code.match(/^([A-Z]?)(\d+)/i);
  if (match) {
    const letter = match[1] || '';
    const num = match[2];
    
    // If starts with letter (extension codes), return 'X'
    if (letter && letter.toUpperCase() !== letter.toLowerCase()) {
      return letter.toUpperCase() === 'X' ? 'X' : '26';
    }
    
    // Pad to 2 digits for chapter lookup
    const numStr = num.substring(0, 2);
    return numStr.padStart(2, '0');
  }
  
  return undefined;
}

// Extract block code from ICD code (e.g., "5A14" -> "5A")
function extractBlockCode(code: string): string | undefined {
  if (!code) return undefined;
  
  // Extract the block prefix (first 1-2 characters that identify the block)
  const match = code.match(/^[A-Z]?\d+[A-Z]?/i);
  return match ? match[0].toUpperCase() : undefined;
}

export function getChapterInfo(code: string): ChapterInfo | undefined {
  const chapterCode = extractChapterCode(code);
  const blockCode = extractBlockCode(code);
  
  if (!chapterCode) return undefined;
  
  return {
    chapterCode,
    chapterTitle: ICD_CHAPTERS[chapterCode] || 'Unknown Chapter',
    blockCode,
  };
}

export async function getParentDiagnoses(parentUrls: string[]): Promise<RelatedDiagnosis[]> {
  const parents: RelatedDiagnosis[] = [];
  
  for (const parentUrl of parentUrls || []) {
    try {
      const detail = await getDiagnosisDetail(parentUrl);
      parents.push({
        id: detail.id,
        code: detail.code,
        title: detail.title,
        relationship: 'parent',
      });
    } catch {
      // Skip failed parent lookups
    }
  }
  
  return parents;
}

export async function getChildDiagnoses(childUrls: string[]): Promise<RelatedDiagnosis[]> {
  const children: RelatedDiagnosis[] = [];
  
  for (const childUrl of childUrls || []) {
    try {
      const detail = await getDiagnosisDetail(childUrl);
      children.push({
        id: detail.id,
        code: detail.code,
        title: detail.title,
        relationship: 'child',
      });
    } catch {
      // Skip failed child lookups
    }
  }
  
  return children;
}

export async function getRelatedFromChapter(code: string, currentId: string): Promise<RelatedDiagnosis[]> {
  const chapterInfo = getChapterInfo(code);
  if (!chapterInfo) return [];
  
  // Search for diagnoses in the same chapter
  const chapterNum = parseInt(chapterInfo.chapterCode);
  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 28) return [];
  
  // Try different search patterns to find chapter diagnoses
  const searchPatterns = [
    `chapter ${chapterInfo.chapterCode}`,
    chapterInfo.chapterTitle.split(' ')[0].toLowerCase(),
  ];
  
  const allResults: RelatedDiagnosis[] = [];
  const seenIds = new Set<string>();
  seenIds.add(currentId);
  
  for (const pattern of searchPatterns) {
    try {
      const results = await searchDiagnoses(pattern);
      for (const result of results.slice(0, 10)) {
        if (!seenIds.has(result.id)) {
          seenIds.add(result.id);
          const resultChapter = extractChapterCode(result.code);
          if (resultChapter === chapterInfo.chapterCode) {
            allResults.push({
              id: result.id,
              code: result.code,
              title: result.title,
              relationship: 'chapter',
            });
          }
        }
      }
    } catch {
      // Continue to next pattern
    }
  }
  
  return allResults.slice(0, 10);
}

export async function getAllRelatedDiagnoses(diagnosisId: string): Promise<RelatedDiagnosis[]> {
  const detail = await getDiagnosisDetail(diagnosisId);
  const related: RelatedDiagnosis[] = [];
  const seenIds = new Set<string>();
  
  // Add parents
  const parents = await getParentDiagnoses(detail.parent || []);
  for (const p of parents) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      related.push(p);
    }
  }
  
  // Add children
  const children = await getChildDiagnoses(detail.child || []);
  for (const c of children) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      related.push(c);
    }
  }
  
  // Add chapter siblings
  const chapterSiblings = await getRelatedFromChapter(detail.code, diagnosisId);
  for (const s of chapterSiblings) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id);
      related.push(s);
    }
  }
  
  return related;
}
