/** Build a query string from an object (supports arrays) */
export function buildQueryString(params: Record<string, any>): string {
  const q = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v])=>{
    if (v === undefined || v === null) return
    if (Array.isArray(v)) v.forEach(item => q.append(k, String(item)))
    else q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** Parse a query string into an object */
export function parseQueryString(queryString: string): Record<string,string> {
  const q = queryString.startsWith('?') ? queryString.slice(1) : queryString
  const p = new URLSearchParams(q)
  const out: Record<string,string> = {}
  p.forEach((v,k)=>{ out[k] = v })
  return out
}

/** Google Maps directions URL for a destination address */
export function getMapDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

/** tel: URL for phones */
export function getTelUrl(phone: string): string {
  const digits = (phone||'').replace(/\D+/g,'')
  return `tel:${digits}`
}
