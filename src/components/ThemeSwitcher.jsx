import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

function ThemeColorGrid({ themeId, className }) {
  return (
    <div
      data-theme={themeId}
      className={`bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md border p-1 shadow-sm transition-colors ${className || ''}`}
    >
      <div className="bg-base-content size-1 rounded-full" />
      <div className="bg-primary size-1 rounded-full" />
      <div className="bg-secondary size-1 rounded-full" />
      <div className="bg-accent size-1 rounded-full" />
    </div>
  );
}

function CheckmarkIcon({ visible }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`h-3 w-3 shrink-0 ${visible ? 'visible' : 'invisible'}`}
    >
      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12px"
      height="12px"
      className="mt-px hidden size-2 fill-current opacity-60 sm:inline-block"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2048 2048"
    >
      <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
    </svg>
  );
}

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? themes.filter((t) =>
        t.name.includes(search) || t.id.includes(search.toLowerCase()) || t.description.includes(search)
      )
    : themes;

  return (
    <div title="Change Theme" className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn group btn-sm gap-1.5 px-1.5 btn-ghost"
        aria-label="Change Theme"
      >
        <ThemeColorGrid
          themeId={theme}
          className="group-hover:border-base-content/20 border-base-content/10"
        />
        <ChevronDownIcon />
      </div>

      <div
        tabIndex={0}
        className="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[30.5rem] max-h-[calc(100vh-8.6rem)] overflow-y-auto border-[length:var(--border)] border-white/5 shadow-2xl outline-[length:var(--border)] outline-black/5 mt-16"
      >
        <ul className="menu w-56">
          <li className="menu-title text-xs">主题</li>

          <li className="sticky top-0 z-10 bg-base-200 px-2 pb-1">
            <div className="flex items-center gap-2">
              <FiSearch size={14} className="text-base-content/30 shrink-0" />
              <input
                type="text"
                className="input input-xs input-ghost flex-1"
                placeholder="搜索主题..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </li>

          {filtered.map((t) => (
            <li key={t.id}>
              <button
                className="gap-3 px-2"
                onClick={() => setTheme(t.id)}
              >
                <ThemeColorGrid themeId={t.id} />
                <div className="w-32 truncate">{t.name}</div>
                <CheckmarkIcon visible={t.id === theme} />
              </button>
            </li>
          ))}

          {filtered.length === 0 && (
            <li className="text-center text-sm text-base-content/40 py-4">无匹配主题</li>
          )}
        </ul>
      </div>
    </div>
  );
}
