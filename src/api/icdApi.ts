import { CONFIG } from './config';
import type { Diagnosis, SearchResult, DiagnosisDetail, PostcoordinationModule } from '../types';

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
