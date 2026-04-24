import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { X, Plus, Minus, Eye, Link2, MousePointer, Pause, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'accessibility_settings';

const defaultSettings = {
  fontSize: 0,
  highContrast: false,
  highlightLinks: false,
  bigCursor: false,
  stopAnimations: false,
};

export default function AccessibilityWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = useCallback((s) => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = s.fontSize === 0 ? '' : `${100 + s.fontSize * 15}%`;

    // High contrast
    root.classList.toggle('accessibility-high-contrast', s.highContrast);

    // Highlight links
    root.classList.toggle('accessibility-highlight-links', s.highlightLinks);

    // Big cursor
    root.classList.toggle('accessibility-big-cursor', s.bigCursor);

    // Stop animations
    root.classList.toggle('accessibility-stop-animations', s.stopAnimations);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applySettings(next);
      return next;
    });
  }, [applySettings]);

  const resetAll = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    applySettings(defaultSettings);
  }, [applySettings]);

  const isHe = language === 'he';

  const actions = [
    {
      label: isHe ? 'הגדלת טקסט' : 'Increase Text',
      icon: <Plus className="w-5 h-5" />,
      onClick: () => updateSetting('fontSize', Math.min(settings.fontSize + 1, 4)),
      active: settings.fontSize > 0,
    },
    {
      label: isHe ? 'הקטנת טקסט' : 'Decrease Text',
      icon: <Minus className="w-5 h-5" />,
      onClick: () => updateSetting('fontSize', Math.max(settings.fontSize - 1, -2)),
      active: settings.fontSize < 0,
    },
    {
      label: isHe ? 'ניגודיות גבוהה' : 'High Contrast',
      icon: <Eye className="w-5 h-5" />,
      onClick: () => updateSetting('highContrast', !settings.highContrast),
      active: settings.highContrast,
    },
    {
      label: isHe ? 'הדגשת קישורים' : 'Highlight Links',
      icon: <Link2 className="w-5 h-5" />,
      onClick: () => updateSetting('highlightLinks', !settings.highlightLinks),
      active: settings.highlightLinks,
    },
    {
      label: isHe ? 'סמן גדול' : 'Big Cursor',
      icon: <MousePointer className="w-5 h-5" />,
      onClick: () => updateSetting('bigCursor', !settings.bigCursor),
      active: settings.bigCursor,
    },
    {
      label: isHe ? 'עצירת אנימציות' : 'Stop Animations',
      icon: <Pause className="w-5 h-5" />,
      onClick: () => updateSetting('stopAnimations', !settings.stopAnimations),
      active: settings.stopAnimations,
    },
  ];

  return (
    <>
      {/* Global accessibility CSS */}
      <style>{`
        .accessibility-high-contrast {
          filter: contrast(1.4) !important;
        }
        .accessibility-high-contrast body {
          background-color: #000 !important;
          color: #fff !important;
        }
        .accessibility-highlight-links a {
          outline: 3px solid #FFD700 !important;
          outline-offset: 2px !important;
          text-decoration: underline !important;
        }
        .accessibility-big-cursor,
        .accessibility-big-cursor * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='white' stroke-width='1' d='M5 3l14 8-6 2 4 8-3 1-4-8-5 4z'/%3E%3C/svg%3E") 4 4, auto !important;
        }
        .accessibility-stop-animations,
        .accessibility-stop-animations * {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `}</style>

      {/* Floating accessibility button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 z-50 w-10 h-10 rounded-full flex items-center justify-center focus:outline-none transition-opacity opacity-70 hover:opacity-100"
        style={{ right: '14px', border: '1.5px solid #B8860B', backgroundColor: 'rgba(253,246,227,0.85)' }}
        aria-label={isHe ? 'פתיחת תפריט נגישות' : 'Open accessibility menu'}
        title={isHe ? 'נגישות' : 'Accessibility'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="1.5"/>
          <path d="M7 8h10"/>
          <path d="M12 8v4"/>
          <path d="M9 20l3-8 3 8"/>
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-32 z-50 w-64 rounded-2xl shadow-xl overflow-hidden"
          style={{ border: '1px solid #D4AF37', backgroundColor: '#FDF6E3', right: '14px' }}
          dir={isHe ? 'rtl' : 'ltr'}
          role="dialog"
          aria-label={isHe ? 'הגדרות נגישות' : 'Accessibility settings'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#FDF6E3' }}>
            <h3 className="font-bold text-lg" style={{ color: '#2D1810' }}>{isHe ? 'נגישות' : 'Accessibility'}</h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={isHe ? 'סגירה' : 'Close'}
              className="rounded-full p-1 hover:opacity-70"
              style={{ color: '#2D1810' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="p-3 space-y-1.5" style={{ backgroundColor: '#FDF6E3' }}>
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: action.active ? '#F5E6A8' : 'transparent',
                  color: '#2D1810',
                  border: action.active ? '1px solid #D4AF37' : '1px solid transparent',
                }}
                aria-pressed={action.active}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}

            {/* Reset */}
            <button
              onClick={resetAll}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent"
              style={{ color: '#B8860B' }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>{isHe ? 'איפוס הגדרות' : 'Reset All'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}