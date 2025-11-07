/** Basic validation utilities */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{10})$/.test((phone||'').replace(/\D+/g,'').length===10? `(xxx) xxx-xxxx` : phone) || (phone||'').replace(/\D+/g,'').length===10
}

export function isValidZipCode(zip: string): boolean {
  return /^(\d{5})(-\d{4})?$/.test(zip)
}

export function isValidOrderNumber(orderNumber: string): boolean {
  return /^[A-Za-z]{2}\d{5,}$/.test(orderNumber)
}

export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!password || password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
  if (!/\d/.test(password)) errors.push('One number')
  return { valid: errors.length===0, errors }
}
