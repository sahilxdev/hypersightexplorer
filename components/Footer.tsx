'use client';

import { Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Hyperliquid Explorer</h3>
            <p className="text-sm text-muted-foreground">
              Real-time blockchain explorer for Hyperliquid powered by Lava Network's high-performance RPC API.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </a>
              </li>
              <li>
                <a href="/analytics" className="text-muted-foreground hover:text-foreground">
                  Analytics
                </a>
              </li>
              <li>
                <a href="/whales" className="text-muted-foreground hover:text-foreground">
                  Whale Tracker
                </a>
              </li>
            </ul>
          </div>

          {/* Powered By */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Powered By</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.lavanet.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Lava Network RPC
                </a>
              </li>
              <li>
                <a
                  href="https://hyperliquid.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Hyperliquid
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Hyperliquid Explorer. Built for HyperEVM Hackathon.
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}