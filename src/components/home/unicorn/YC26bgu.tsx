'use client';

import { useEffect } from 'react';

// TypeScript declarations for UnicornStudio
declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => void;
    };
  }
}

interface YC26bguProps {
  className?: string;
}

export default function YC26bgu({ 
  className = ''
}: YC26bguProps) {
  useEffect(() => {
    // Initialize Unicorn Studio exactly as per embed code
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: () => {} };
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js";
      script.onload = function() {
        if (!window.UnicornStudio?.isInitialized) {
          window.UnicornStudio?.init();
          if (window.UnicornStudio) {
            window.UnicornStudio.isInitialized = true;
          }
        }
      };
      (document.head || document.body).appendChild(script);
    }

    // Remove Unicorn Studio branding
    const hideUnicornBranding = () => {
      // Remove all elements that link to unicorn.studio
      document.querySelectorAll('a[href*="unicorn.studio"]').forEach((el) => {
        el.remove();
      });
    };

    // Run once after 1.5s (in case Unicorn loads late)
    const timeout = setTimeout(hideUnicornBranding, 1500);

    // Keep watching in case it reappears
    const observer = new MutationObserver(hideUnicornBranding);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`yc26bgu-container ${className}`}>
      <div 
        id="unicorn-yc26bgu"
        data-us-project="02M16UZUCvskPup1a3OT"
      >
        <canvas aria-label="Unicorn Studio YC26bgu Scene" role="img"></canvas>
      </div>

      <style jsx>{`
        .yc26bgu-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: -3rem;
          width: 100%;
          height: calc(100% + 3rem);
          z-index: 0;
          overflow: hidden;
        }
        
        #unicorn-yc26bgu {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 112%;
          bottom: -8%;
        }
        
        #unicorn-yc26bgu canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        
        /* Hide Unicorn Studio watermark */
        #unicorn-yc26bgu a{
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
