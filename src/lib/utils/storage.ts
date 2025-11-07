export enum StorageKeys {
  AUTH_TOKEN = "AUTH_TOKEN",
  USER_PREFERENCES = "USER_PREFERENCES",
  FILTER_STATE = "FILTER_STATE",
}

export function setItem(key: string, value: any): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function getItem<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : null
  } catch { return null }
}

export function removeItem(key: string): void {
  try { localStorage.removeItem(key) } catch {}
}

export function clear(): void {
  try { localStorage.clear() } catch {}
}
