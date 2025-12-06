/**
 * Generates a URL-friendly slug from a string
 * Preserves slashes for nested paths
 */
export const generateSlug = (text: string, preserveSlashes: boolean = false): string => {
  if (preserveSlashes) {
    // For pages with nested paths, preserve slashes
    return text
      .toLowerCase()
      .trim()
      .split('/')
      .map(part => 
        part
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      )
      .filter(part => part.length > 0)
      .join('/');
  }
  
  // Default behavior: no slashes
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validates if a slug is in the correct format
 * Allows slashes for nested paths (e.g., "legal/dati-societari")
 */
export const isValidSlug = (slug: string, allowSlashes: boolean = false): boolean => {
  if (allowSlashes) {
    // For pages: allow slashes, validate each segment
    const segments = slug.split('/');
    return segments.every(segment => 
      segment.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)
    );
  }
  
  // Default: no slashes (for blog, portfolio, etc.)
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};
