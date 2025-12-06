import { marked } from 'marked';

// Enable GitHub-flavored markdown and preserve line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
});

/**
 * Converts a markdown string into HTML that can be injected with set:html.
 * Returns an empty string when there is no content to render.
 */
export const renderMarkdownToHtml = (markdown?: string | null): string => {
  if (!markdown?.trim()) {
    return '';
  }

  return marked.parse(markdown) as string;
};
