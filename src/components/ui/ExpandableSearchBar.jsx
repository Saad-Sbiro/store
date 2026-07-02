import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

export default function ExpandableSearchBar({ onSearch, className = '' }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (expanded) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [expanded]);

  const runSearch = (value) => {
    const cleanQuery = value.trim();
    if (!cleanQuery) return;
    onSearch?.(cleanQuery);
    setExpanded(false);
    setQuery('');
  };

  const submit = (event) => {
    event?.preventDefault();
    if (!expanded) {
      setExpanded(true);
      return;
    }
    runSearch(query);
  };

  return (
    <div className="relative h-10 w-10 shrink-0">
      <form
        onSubmit={submit}
        className={clsx(
          'liquid-search absolute right-0 top-0 flex h-10 items-center overflow-hidden rounded-full border border-transparent text-white transition-[width,transform,box-shadow] duration-300 ease-expo',
          expanded ? 'w-[min(calc(100vw-9rem),210px)] z-50' : 'liquid-search--compact w-10 z-0',
          className
        )}
      >
      <button
        type="submit"
        aria-label={expanded ? 'Submit search' : 'Open search'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-white/82 transition-colors duration-200 hover:text-white"
      >
        <Search size={18} strokeWidth={1.8} className="block" />
      </button>

      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setExpanded(false);
            setQuery('');
          }
        }}
        placeholder="البحث..."
        className="min-w-0 flex-1 bg-transparent pr-9 text-[13px] font-semibold text-white placeholder:text-white/45 outline-none"
      />

      {expanded && (
        <button
          type="button"
          aria-label="Close search"
          onClick={() => {
            setExpanded(false);
            setQuery('');
          }}
          className="absolute right-2 grid h-6 w-6 place-items-center rounded-full text-white/65 transition-colors hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </form>
    </div>
  );
}
