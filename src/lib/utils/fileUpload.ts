const ACCEPTED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
]

export function validateImageFile(file: File): boolean {
  const okType = ACCEPTED_IMAGE_MIME.includes(file.type)
  const okSize = file.size <= 10 * 1024 * 1024
  return okType && okSize
}

export function validateAvatarFile(file: File): boolean {
  const okType = ACCEPTED_IMAGE_MIME.includes(file.type)
  const okSize = file.size <= 2 * 1024 * 1024
  return okType && okSize
}

export async function convertFileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer())
  return buf.toString('base64')
}

export function getFileExtension(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.substring(i + 1) : ''
}

export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName) || 'jpg'
  const base = originalName.replace(/\.[^/.]+$/, '')
  const rand = Math.random().toString(36).slice(2, 8)
  const stamp = Date.now()
  return `${base}-${stamp}-${rand}.${ext}`
}
