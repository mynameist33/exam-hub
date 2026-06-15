import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Simple custom Markdown + LaTeX parser
export default function MarkdownRenderer({ text = '' }) {
  if (typeof text !== 'string') return text;

  // Tokenize by:
  // 1. Block Math: $$ ... $$
  // 2. Inline Math: $ ... $
  // 3. Block Code: ``` ... ```
  // 4. Inline Code: ` ... `
  const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|```\w*\n[\s\S]+?```|`[\s\S]+?`)/g;
  const parts = text.split(tokenRegex);

  return (
    <span className="markdown-body">
      {parts.map((part, index) => {
        if (!part) return null;

        // Check if block math
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
            return (
              <span 
                key={index} 
                className="math-block"
                dangerouslySetInnerHTML={{ __html: html }} 
                style={{ 
                  display: 'block', 
                  margin: '14px 0', 
                  overflowX: 'auto', 
                  overflowY: 'hidden',
                  padding: '5px 0'
                }} 
              />
            );
          } catch {
            return <code key={index} style={{ color: 'var(--color-danger)' }}>{part}</code>;
          }
        }

        // Check if inline math
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
            return <span key={index} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <code key={index} style={{ color: 'var(--color-danger)' }}>{part}</code>;
          }
        }

        // Check if block code
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.split('\n');
          const firstLine = lines[0];
          const lang = firstLine.slice(3).trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <pre key={index} className="code-block-container" style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '14px 18px',
              overflowX: 'auto',
              margin: '14px 0',
              fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
              fontSize: '13px',
              textAlign: 'left',
              lineHeight: '1.5'
            }}>
              {lang && (
                <div className="code-lang" style={{ 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  color: 'var(--text-muted)', 
                  marginBottom: '8px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  paddingBottom: '4px',
                  fontWeight: '600' 
                }}>
                  💻 {lang}
                </div>
              )}
              <code style={{ color: '#e2e8f0', whiteSpace: 'pre', fontFamily: 'inherit' }}>{code}</code>
            </pre>
          );
        }

        // Check if inline code
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = part.slice(1, -1);
          return (
            <code key={index} className="inline-code" style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '90%',
              color: '#f472b6',
              margin: '0 2px'
            }}>
              {code}
            </code>
          );
        }

        // Otherwise, it is normal text. Parse bold, italic, and newlines.
        return renderTextWithFormatting(part, index);
      })}
    </span>
  );
}

function renderTextWithFormatting(text, key) {
  // Split by bold (** ... **) or italic (* ... *)
  const formatRegex = /(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*)/g;
  const parts = text.split(formatRegex);

  return (
    <span key={key}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} style={{ fontWeight: '700', color: 'var(--text-main)' }}>{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index} style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>{part.slice(1, -1)}</em>;
        }

        // Replace newlines with <br />
        const lines = part.split('\n');
        return lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </span>
  );
}
