'use client';

import Link from 'next/link';
import { Activity, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/themeContext';
import { useNetwork } from '@/lib/networkContext';
import UniversalSearch from './UniversalSearch';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { network, setNetwork } = useNetwork();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-primary">Hyperliquid Explorer</span>
          </Link>

          {/* Universal Search */}
          <div className="flex-1 max-w-2xl w-full">
            <UniversalSearch />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link href="/analytics" className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                Analytics
              </Link>
              <Link href="/whales" className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                Whales
              </Link>
            </nav>

            {/* Network Switcher */}
            {mounted && (
              <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
                <button
                  onClick={() => setNetwork('mainnet')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    network === 'mainnet'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Mainnet
                </button>
                <button
                  onClick={() => setNetwork('testnet')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    network === 'testnet'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Testnet
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}