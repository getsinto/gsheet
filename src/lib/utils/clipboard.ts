import { showError, showSuccess } from "./toast"

/** Copy a string to the clipboard. Returns true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      showSuccess('Copied to clipboard!')
      return true
    }
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    if (ok) showSuccess('Copied to clipboard!'); else showError('Failed to copy')
    return ok
  } catch {
    showError('Failed to copy')
    return false
  }
}
