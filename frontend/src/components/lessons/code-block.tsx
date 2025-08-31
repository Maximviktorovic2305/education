'use client';

import { useState, useEffect } from 'react';
import Prism from 'prismjs';

// Import Go language support
import 'prismjs/components/prism-go';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'go',
  showLineNumbers = false,
  title,
  className = '',
}) => {
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    if (code) {
      try {
        const highlighted = Prism.highlight(code, Prism.languages[language] || Prism.languages.go, language);
        setHighlightedCode(highlighted);
      } catch {
        // Fallback to plain text if highlighting fails
        setHighlightedCode(code);
      }
    }
  }, [code, language]);

  if (!code) return null;

  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="bg-muted px-4 py-2 border border-b-0 rounded-t-lg">
          <span className="text-sm text-muted-foreground font-mono">{title}</span>
        </div>
      )}
      <div className="relative">
        <pre className={`
          ${title ? 'rounded-t-none' : 'rounded-lg'} 
          bg-slate-900 dark:bg-slate-800 
          p-4 
          overflow-x-auto 
          text-sm 
          border
          ${showLineNumbers ? 'pl-12' : ''}
        `}>
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-800 dark:bg-slate-700 flex flex-col py-4 text-slate-400 text-xs">
              {code.split('\n').map((_, index) => (
                <div key={index} className="h-5 flex items-center justify-end pr-2 font-mono">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <code 
            className={`language-${language} text-slate-100`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};