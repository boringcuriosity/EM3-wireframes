/**
 * Normalize mobile number to consistent format
 * Removes spaces, dashes, and ensures 12 digit format with 91 prefix
 */
export function normalizeMobile(mobile: string): string {
  // Remove all non-digit characters
  const digits = mobile.replace(/\D/g, '');
  
  // If starts with 91 and has 12 digits, return as-is
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  
  // Take last 10 digits and prefix with 91
  const last10 = digits.slice(-10);
  return `91${last10}`;
}

/**
 * Format mobile for display
 */
export function formatMobile(mobile: string): string {
  const normalized = normalizeMobile(mobile);
  if (normalized.length === 12 && normalized.startsWith('91')) {
    const digits = normalized.slice(2);
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return mobile;
}

/**
 * Validate Indian mobile number
 */
export function isValidMobile(mobile: string): boolean {
  const normalized = normalizeMobile(mobile);
  // Indian mobile numbers: 91 prefix + start with 6, 7, 8, or 9 and are 12 digits total
  return /^91[6-9]\d{9}$/.test(normalized);
}
