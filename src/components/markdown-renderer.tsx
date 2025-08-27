
import React from 'react';

// A simple and safe markdown-to-HTML renderer.

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;
  
  // 1. Escape HTML to prevent XSS attacks, but keep it simple
  const escapeHtml = (unsafe: string): string => {
    if(!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };
  
  // 2. Process inline markdown elements
  const formatInline = (line: string): string => {
    let formattedLine = escapeHtml(line);
    // Links: [text](url) -> <a href="url" class="text-primary hover:underline">text</a>
    formattedLine = formattedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    // Bold: **text** -> <strong class="text-foreground">text</strong>
    formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>');
    // Italic: _text_ -> <em>text</em>
    formattedLine = formattedLine.replace(/_(.*?)_/g, '<em>$1</em>');
    // Strikethrough: ~~text~~ -> <s>text</s>
    formattedLine = formattedLine.replace(/~~(.*?)~~/g, '<s>$1</s>');
    // Inline code: `text` -> <code>text</code>
    formattedLine = formattedLine.replace(/`(.*?)`/g, '<code>$1</code>');
    return formattedLine;
  };

  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let inTable = false;
  let tableHtml = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for table start/continuation
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        // This is the start of a table
        inTable = true;
        tableHtml = '<table>';
        const headerLine = line;
        const separatorLine = lines[i + 1] || '';
        
        if (separatorLine.trim().startsWith('|') && separatorLine.includes('---')) {
          const headers = headerLine.split('|').slice(1, -1).map(h => h.trim());
          tableHtml += '<thead><tr>';
          headers.forEach(h => { tableHtml += `<th>${formatInline(h)}</th>`; });
          tableHtml += '</tr></thead><tbody>';
          i++; // Consume separator line
        } else {
          // Malformed table, treat as plain text
          inTable = false;
          tableHtml = '';
          if (line.trim()) {
            elements.push(`<p>${formatInline(line)}</p>`);
          }
          continue;
        }
      } else {
        // This is a row in an existing table
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        tableHtml += '<tr>';
        cells.forEach(cell => { tableHtml += `<td>${formatInline(cell)}</td>`; });
        tableHtml += '</tr>';
      }
    } else {
      // Not in a table or table has ended
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        elements.push(tableHtml);
        tableHtml = '';
      }

      // Handle blockquotes
      if (line.startsWith('> ')) {
        elements.push(`<blockquote>${formatInline(line.substring(2))}</blockquote>`);
      } 
      // Handle list items
      else if (line.startsWith('* ') || line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          elements.push('<ul>');
        }
        elements.push(`<li>${formatInline(line.substring(2))}</li>`);
      } 
      // Handle paragraphs
      else {
        if (inList) {
          inList = false;
          elements.push('</ul>');
        }
        if (line.trim()) {
          elements.push(`<p>${formatInline(line)}</p>`);
        }
      }
    }
  }

  // Close any open tags at the end of the content
  if (inTable) {
    tableHtml += '</tbody></table>';
    elements.push(tableHtml);
  }
  if (inList) {
    elements.push('</ul>');
  }

  const finalHtml = elements.join('');

  return <div className="inline" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
}
