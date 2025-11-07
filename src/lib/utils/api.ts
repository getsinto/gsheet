export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
  const ct = res.headers.get('content-type') || ''
  if (!res.ok) {
    let message = 'API request failed'
    try { if (ct.includes('application/json')) { const err = await res.json(); message = err?.message || message } else { message = await res.text() } } catch {}
    throw new Error(message)
  }
  if (ct.includes('application/json')) return res.json()
  // @ts-expect-error - allow non-json generics
  return res.text()
}

export const api = {
  get: <T>(url: string, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: any, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: any, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: any, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'DELETE' }),
}
