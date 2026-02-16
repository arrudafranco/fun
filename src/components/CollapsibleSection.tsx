import { useState, useEffect, useId } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
  tutorialAttr?: string;
  /** Extra content rendered inline in the header row (right side, before chevron) */
  headerRight?: React.ReactNode;
  /** Override header title color (default: text-slate-400) */
  titleClass?: string;
}

const STORAGE_PREFIX = 'miranda-section-';

export default function CollapsibleSection({
  id,
  title,
  defaultCollapsed = false,
  children,
  className = '',
  tutorialAttr,
  headerRight,
  titleClass = 'text-slate-400',
}: CollapsibleSectionProps) {
  const panelId = useId();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + id);
      if (stored !== null) return stored === '1';
    } catch { /* ignore */ }
    return defaultCollapsed;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + id, collapsed ? '1' : '0');
    } catch { /* ignore */ }
  }, [id, collapsed]);

  // Expand when tutorial requests it
  useEffect(() => {
    function handleTutorialExpand() {
      setCollapsed(false);
    }
    window.addEventListener('tutorial-expand-sections', handleTutorialExpand);
    return () => window.removeEventListener('tutorial-expand-sections', handleTutorialExpand);
  }, []);

  return (
    <div className={className} {...(tutorialAttr ? { 'data-tutorial': tutorialAttr } : {})}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-expanded={!collapsed}
          aria-controls={panelId}
          data-tutorial="collapse-chevron"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-0.5 -ml-1"
        >
          <svg
            aria-hidden="true"
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
          <h2 className={`text-xs font-semibold uppercase tracking-wider font-pixel select-none ${titleClass}`}>
            {title}
          </h2>
        </button>
        {headerRight && <div className="ml-auto flex items-center gap-2">{headerRight}</div>}
        <span className="sr-only">{collapsed ? 'Section collapsed' : 'Section expanded'}</span>
      </div>
      <div
        id={panelId}
        role="region"
        aria-label={title}
        className={`transition-all duration-300 overflow-hidden ${collapsed ? 'max-h-0' : 'max-h-[4000px]'}`}
        style={collapsed ? { visibility: 'hidden' } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
