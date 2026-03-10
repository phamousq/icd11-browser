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
  return data.result || [];
}

export async function getDiagnosisDetail(id: string): Promise<DiagnosisDetail> {
  await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/entity/${id}`;
  
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

  return response.json();
}

export async function getPostcoordinationOptions(id: string): Promise<PostcoordinationModule[]> {
  await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/entity/${id}/postcoordination`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      return getPostcoordinationOptions(id);
    }
    const errorBody = await parseErrorResponse(response);
    throw new Error(`Get postcoordination failed: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.module || [];
}
