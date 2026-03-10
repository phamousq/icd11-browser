import { CONFIG } from './config';
import type { Diagnosis, SearchResult, DiagnosisDetail, PostcoordinationModule } from '../types';

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

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
    throw new Error(`Auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  return cachedToken!;
}

function getHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${cachedToken}`,
    'API-Version': CONFIG.apiVersion,
    'Accept-Language': 'en',
  };
}

export async function searchDiagnoses(query: string): Promise<Diagnosis[]> {
  await getToken();
  
  const url = `${CONFIG.apiBaseUrl}/release/11/${CONFIG.releaseVersion}/mms/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedToken = null;
      return searchDiagnoses(query);
    }
    throw new Error(`Search failed: ${response.status}`);
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
      cachedToken = null;
      return getDiagnosisDetail(id);
    }
    throw new Error(`Get detail failed: ${response.status}`);
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
      cachedToken = null;
      return getPostcoordinationOptions(id);
    }
    throw new Error(`Get postcoordination failed: ${response.status}`);
  }

  const data = await response.json();
  return data.module || [];
}
