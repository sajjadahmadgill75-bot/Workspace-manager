import { WorkspaceManagerStore } from '../../types/workspace';
import initialMockData from '../../mock/index';

const STORAGE_KEY = 'WORKSPACE_MANAGER_STATE_V2';
const DB_NAME = 'WorkspaceManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

// IndexedDB Helper Functions
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject('IndexedDB not available');
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveToIndexedDB(state: any): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(state, 'current_state');
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage only', err);
  }
}

export async function loadFromIndexedDB(): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_state');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

// LocalStorage Helpers
export function saveToLocalStorage(state: any): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
}

export function loadFromLocalStorage(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error('LocalStorage read failed:', err);
    return null;
  }
}

// Schema Validation for JSON Import
export function validateStateSchema(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid JSON root object.' };
  }

  const requiredArrays = ['users', 'workspaces', 'projects', 'tasks', 'comments', 'activityLogs', 'notifications'];
  for (const key of requiredArrays) {
    if (!Array.isArray(payload[key])) {
      return { valid: false, error: `Missing or invalid array property '${key}'.` };
    }
  }

  return { valid: true };
}

export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    indexedDB.deleteDatabase(DB_NAME);
  } catch (err) {
    console.error('Failed to clear client storage:', err);
  }
}
