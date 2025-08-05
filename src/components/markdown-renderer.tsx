'use client';

import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const formattedContent = useMemo(() => {
    // Simple markdown parsing for common elements
    let html = content;

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` data-lang="${lang}"` : '';
      return `<div class="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto">
        <pre${language}><code class="text-sm">${code.trim()}</code></pre>
      </div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // Lists
    html = html.replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-6 mb-1 list-decimal">$1</li>');
    html = html.replace(/^[-*]\s+(.*$)/gm, '<li class="ml-6 mb-1 list-disc">$1</li>');
    
    // Wrap consecutive list items in ul/ol
    html = html.replace(/((<li class="ml-6 mb-1 list-disc">.*<\/li>\s*)+)/g, '<ul class="mb-3">$1</ul>');
    html = html.replace(/((<li class="ml-6 mb-1 list-decimal">.*<\/li>\s*)+)/g, '<ol class="mb-3">$1</ol>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-3">');
    html = html.replace(/\n/g, '<br/>');

    // Wrap in paragraph if not already wrapped
    if (!html.includes('<p>') && !html.includes('<h') && !html.includes('<ul>') && !html.includes('<ol>') && !html.includes('<div>')) {
      html = `<p class="mb-3">${html}</p>`;
    } else if (!html.startsWith('<')) {
      html = `<p class="mb-3">${html}`;
    }

    return html;
  }, [content]);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}
