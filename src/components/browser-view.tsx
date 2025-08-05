'use client';

import { useEffect, useRef } from 'react';

interface BrowserViewProps {
  htmlContent: string;
}

export function BrowserView({ htmlContent }: BrowserViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  if (!htmlContent) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
        <p className="text-gray-500">Waiting for automation to start...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-inner border border-gray-300">
      <iframe
        ref={iframeRef}
        title="Agent Browser"
        className="w-full h-full border-0"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
