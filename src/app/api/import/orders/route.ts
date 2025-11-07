import { NextRequest } from 'next/server'
import { requireAdmin, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

// Very basic CSV parser for common cases (quoted fields with commas)
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }
  const parseLine = (line: string) => {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur)
    return out
  }
  const headers = parseLine(lines[0]).map((h) => h.trim())
  const rows = lines.slice(1).map(parseLine)
  return { headers, rows }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return jsonError('No file uploaded', 400)

    const text = await file.text()
    const { headers, rows } = parseCSV(text)
    if (headers.length === 0) return jsonError('Empty CSV', 400)

    // Map common headers to DB fields
    const mapHeader = (h: string) => h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const headerMap = headers.map(mapHeader)

    const supabase = createRouteHandlerClient(req)

    let total_rows = rows.length
    let successful_imports = 0
    let failed_imports = 0
    const errors: { row: number; reason: string }[] = []

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx]
      try {
        const rec: any = {}
        headerMap.forEach((key, i) => { rec[key] = row[i] })
        // Basic required fields mapping (expects certain columns existing in CSV)
        const payload: any = {
          order_number: rec.order_number || undefined,
          date: rec.date,
          delivery_window: rec.delivery_window,
          driver_id: rec.driver_id || null,
          driver_name: rec.driver_name,
          market: rec.market,
          week_number: Number(rec.week_number),
          pickup_street: rec.pickup_street,
          pickup_city: rec.pickup_city,
          pickup_state: rec.pickup_state,
          pickup_zip: rec.pickup_zip,
          container_type: rec.container_type,
          container_condition: rec.container_condition || null,
          door_position: rec.door_position || null,
          release_number: rec.release_number || null,
          customer_name: rec.customer_name,
          customer_street: rec.customer_street,
          customer_city: rec.customer_city,
          customer_state: rec.customer_state,
          customer_zip: rec.customer_zip,
          customer_phone: rec.customer_phone,
          driver_pay: rec.driver_pay ? Number(rec.driver_pay) : 0,
          miles: rec.miles ? Number(rec.miles) : 0,
          notes: rec.notes || null,
          status: rec.status || 'dispatched',
          is_dispatched: rec.is_dispatched ? rec.is_dispatched === 'true' : true,
          created_by: user!.id,
        }

        const { error: insErr } = await supabase.from('orders').insert(payload)
        if (insErr) throw new Error(insErr.message)
        successful_imports++
      } catch (e: any) {
        failed_imports++
        errors.push({ row: idx + 2, reason: e.message ?? 'Invalid row' }) // +2 for header and 1-indexing
      }
    }

    return jsonOk({ total_rows, successful_imports, failed_imports, errors }, 'Import completed')
  } catch (e: any) {
    return jsonError('Failed to import orders', 500)
  }
}
