import React from 'react';

interface CodeBlockProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  title, 
  description, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm overflow-x-auto ${className}`}>
      {description && (
        <div className="text-gray-400 mb-3">
          {description}
        </div>
      )}
      {title && (
        <div className="text-gray-500 mb-2">{title}</div>
      )}
      <pre className="text-gray-300">
        {children}
      </pre>
    </div>
  );
};