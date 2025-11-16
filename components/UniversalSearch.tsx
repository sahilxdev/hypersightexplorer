'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Hash, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'block' | 'transaction' | 'address';
  value: string;
  label: string;
}

export default function UniversalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect search type
  const detectType = (input: string): SearchResult | null => {
    const trimmed = input.trim();

    // Block number (numeric)
    if (/^\d+$/.test(trimmed)) {
      return {
        type: 'block',
        value: trimmed,
        label: `Block #${trimmed}`,
      };
    }

    // Transaction hash or Address (0x...)
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      return {
        type: 'transaction',
        value: trimmed,
        label: `Transaction ${trimmed.slice(0, 10)}...${trimmed.slice(-8)}`,
      };
    }

    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return {
        type: 'address',
        value: trimmed,
        label: `Address ${trimmed.slice(0, 10)}...${trimmed.slice(-8)}`,
      };
    }

    return null;
  };

  // Handle input change
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      return;
    }

    const detected = detectType(query);
    if (detected) {
      setResults([detected]);
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle search submission
  const handleSearch = (result: SearchResult) => {
    // Save to recent searches
    const updated = [result, ...recentSearches.filter(r => r.value !== result.value)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate
    switch (result.type) {
      case 'block':
        router.push(`/block/${result.value}`);
        break;
      case 'transaction':
        router.push(`/tx/${result.value}`);
        break;
      case 'address':
        router.push(`/address/${result.value}`);
        break;
    }

    setIsOpen(false);
    setQuery('');
  };

  // Clear recent searches
  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm"
      >
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">Search blocks, txns, addresses...</span>
        <span className="sm:hidden text-muted-foreground">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-background rounded text-xs">
          <span>⌘K</span>
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl bg-card border rounded-lg shadow-2xl mx-4">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results.length > 0) {
                    handleSearch(results[0]);
                  }
                }}
                placeholder="Search by Block Number, Transaction Hash, or Address..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Search Results or Recent Searches */}
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs text-muted-foreground px-3 py-2">Search Results</div>
                  {results.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(result)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-secondary rounded-lg transition-colors text-left"
                    >
                      {result.type === 'block' && (
                        <div className="p-2 bg-primary/10 rounded">
                          <Hash className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      {result.type === 'transaction' && (
                        <div className="p-2 bg-blue-500/10 rounded">
                          <Hash className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                      {result.type === 'address' && (
                        <div className="p-2 bg-green-500/10 rounded">
                          <Wallet className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">Enter ↵</div>
                    </button>
                  ))}
                </div>
              ) : query.length > 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found</p>
                  <p className="text-sm mt-1">Try a block number (e.g., 12345), transaction hash, or address</p>
                </div>
              ) : recentSearches.length > 0 ? (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-xs text-muted-foreground">Recent Searches</div>
                    <button
                      onClick={clearRecent}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(result)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-secondary rounded-lg transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{result.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-2">Quick Search</p>
                  <div className="text-sm space-y-1">
                    <p>• Block Number: <code className="px-1 py-0.5 bg-secondary rounded">12345</code></p>
                    <p>• Transaction: <code className="px-1 py-0.5 bg-secondary rounded">0x123...</code> (64 chars)</p>
                    <p>• Address: <code className="px-1 py-0.5 bg-secondary rounded">0x123...</code> (40 chars)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded">↵</kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
              <div>Powered by Lava Network</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
