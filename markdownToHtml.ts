
// src/utils/markdownToHtml.ts
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Process fenced code blocks first to protect their content
  // ```lang\ncode\n``` or ```\ncode\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : '';
    // Basic escaping for HTML within code blocks
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code class="${languageClass}">${escapedCode}</code></pre>`;
  });

  // Bold: **text** or __text__
  // Ensuring it doesn't greedily match across newlines if not intended for multi-line bold.
  // This regex handles single line or carefully constructed multi-line bold.
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__((?:(?!__)|[\s\S])*)__/g, '<strong>$1</strong>');

  // Italics: *text* or _text_
  // Simple version: these should be applied after bold or use more complex regex to avoid conflicts.
  // The lookarounds help prevent matching parts of **bold**.
  html = html.replace(/(?<!\*)\*(?!\s|\*)([^\s*](?:.*?[^\s*])?)(?<!\s)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!\s|_)([^\s_](?:.*?[^\s_])?)(?<!\s)_(?!_)/g, '<em>$1</em>');
  
  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, (_match, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<code>${escapedCode}</code>`;
  });
  
  // Convert remaining newlines to <br /> for paragraphs, only if not inside <pre>
  // This is tricky. If a line is part of a <pre> block already, we don't want to add <br>.
  // A simpler way for `whitespace-pre-wrap` is to just let it handle newlines.
  // However, if we want true paragraphs from double newlines, that's more complex.
  // For now, let newlines be handled by `whitespace-pre-wrap` and markdown's own block elements.
  // The PRE block will preserve its internal newlines correctly.

  return html;
}
