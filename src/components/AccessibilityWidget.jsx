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
        className="fixed bottom-20 z-50 w-12 h-12 rounded-full bg-blue-700 text-white shadow-lg flex items-center justify-center hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
        style={{ [isHe ? 'left' : 'right']: '16px' }}
        aria-label={isHe ? 'פתיחת תפריט נגישות' : 'Open accessibility menu'}
        title={isHe ? 'נגישות' : 'Accessibility'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="1.5"/>
          <path d="M7 8h10"/>
          <path d="M12 8v4"/>
          <path d="M9 20l3-8 3 8"/>
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-36 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ [isHe ? 'left' : 'right']: '16px' }}
          dir={isHe ? 'rtl' : 'ltr'}
          role="dialog"
          aria-label={isHe ? 'הגדרות נגישות' : 'Accessibility settings'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-700 text-white">
            <h3 className="font-bold text-lg">{isHe ? 'נגישות' : 'Accessibility'}</h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={isHe ? 'סגירה' : 'Close'}
              className="hover:bg-blue-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="p-3 space-y-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  action.active
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                aria-pressed={action.active}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}

            {/* Reset */}
            <button
              onClick={resetAll}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-transparent"
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