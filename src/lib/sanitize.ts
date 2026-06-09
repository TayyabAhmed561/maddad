// Strip HTML tags and control characters from user text inputs.
// Allows printable ASCII, Latin Extended, and Arabic (for donor names/descriptions).
// Apply at every public form submission boundary before writing to the DB.

export function sanitizeText(input: string, maxLength: number): string {
  return input
    .replace(/<[^>]*>/g, '')                          // strip HTML tags
    .replace(/[^\x20-\x7E -ɏ؀-ۿ]/g, '') // allow Latin + Arabic only
    .trim()
    .slice(0, maxLength)
}

// Sanitize email — lowercase, strip whitespace, enforce reasonable length
export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase().slice(0, 254)
}
