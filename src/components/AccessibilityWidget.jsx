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
  const isHe = language === 'he';

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
    root.style.fontSize = s.fontSize === 0 ? '' : `${100 + s.fontSize * 15}%`;
    root.classList.toggle('a11y-contrast', s.highContrast);
    root.classList.toggle('a11y-links', s.highlightLinks);
    root.classList.toggle('a11y-cursor', s.bigCursor);
    root.classList.toggle('a11y-no-motion', s.stopAnimations);
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

  const actions = [
    { label: isHe ? 'הגדלת טקסט' : 'Increase Text', icon: <Plus className="w-4 h-4" />, onClick: () => updateSetting('fontSize', Math.min(settings.fontSize + 1, 4)), active: settings.fontSize > 0 },
    { label: isHe ? 'הקטנת טקסט' : 'Decrease Text', icon: <Minus className="w-4 h-4" />, onClick: () => updateSetting('fontSize', Math.max(settings.fontSize - 1, -2)), active: settings.fontSize < 0 },
    { label: isHe ? 'ניגודיות גבוהה' : 'High Contrast', icon: <Eye className="w-4 h-4" />, onClick: () => updateSetting('highContrast', !settings.highContrast), active: settings.highContrast },
    { label: isHe ? 'הדגשת קישורים' : 'Highlight Links', icon: <Link2 className="w-4 h-4" />, onClick: () => updateSetting('highlightLinks', !settings.highlightLinks), active: settings.highlightLinks },
    { label: isHe ? 'סמן גדול' : 'Big Cursor', icon: <MousePointer className="w-4 h-4" />, onClick: () => updateSetting('bigCursor', !settings.bigCursor), active: settings.bigCursor },
    { label: isHe ? 'עצירת אנימציות' : 'Stop Animations', icon: <Pause className="w-4 h-4" />, onClick: () => updateSetting('stopAnimations', !settings.stopAnimations), active: settings.stopAnimations },
  ];

  return (
    <>
      <style>{`
        .a11y-contrast { filter: contrast(1.4) !important; }
        .a11y-contrast body { background-color: #000 !important; color: #fff !important; }
        .a11y-links a { outline: 3px solid #FFD700 !important; outline-offset: 2px !important; text-decoration: underline !important; }
        .a11y-cursor, .a11y-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='white' stroke-width='1' d='M5 3l14 8-6 2 4 8-3 1-4-8-5 4z'/%3E%3C/svg%3E") 4 4, auto !important; }
        .a11y-no-motion, .a11y-no-motion * { animation-duration: 0s !important; transition-duration: 0s !important; }
      `}</style>

      {/* Tab — thin strip on right edge, half hidden */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 flex items-center justify-center"
          style={{
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '28px',
            height: '56px',
            borderRadius: '8px 0 0 8px',
            border: '1px solid #D4AF37',
            borderRight: 'none',
            backgroundColor: 'rgba(253,246,227,0.9)',
            opacity: 0.55,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.55'}
          aria-label={isHe ? 'פתיחת תפריט נגישות' : 'Open accessibility menu'}
          title={isHe ? 'נגישות' : 'Accessibility'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="1.5"/>
            <path d="M7 8h10"/>
            <path d="M12 8v4"/>
            <path d="M9 20l3-8 3 8"/>
          </svg>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed z-50 w-56 rounded-l-xl shadow-lg overflow-hidden"
          style={{
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            border: '1px solid #D4AF37',
            borderRight: 'none',
            backgroundColor: '#FDF6E3',
          }}
          dir={isHe ? 'rtl' : 'ltr'}
          role="dialog"
          aria-label={isHe ? 'הגדרות נגישות' : 'Accessibility settings'}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#D4AF37' }}>
            <span className="text-sm font-semibold" style={{ color: '#2D1810' }}>{isHe ? 'נגישות' : 'Accessibility'}</span>
            <button onClick={() => setIsOpen(false)} className="p-0.5 hover:opacity-60" aria-label={isHe ? 'סגירה' : 'Close'}>
              <X className="w-4 h-4" style={{ color: '#2D1810' }} />
            </button>
          </div>

          <div className="p-2 space-y-1">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors"
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
            <button
              onClick={resetAll}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium"
              style={{ color: '#B8860B' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isHe ? 'איפוס' : 'Reset'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}