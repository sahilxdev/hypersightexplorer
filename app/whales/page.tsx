'use client';

import { useQuery } from '@tanstack/react-query';
import { getLatestBlocks } from '@/lib/lavaRpc';
import { weiToEth, formatEth, truncateHash, getRelativeTime, getWhaleEmoji } from '@/lib/utils';
import { WhaleTransaction } from '@/lib/types';
import Link from 'next/link';
import { TrendingUp, Filter, Save, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { saveWhaleTransaction, getSavedWhaleTransactions, clearSavedWhaleTransactions } from '@/lib/utils';

export default function WhaleTrackerPage() {
  const [minValue, setMinValue] = useState(10000);
  const [showSavedWhales, setShowSavedWhales] = useState(false);
  const [savedWhales, setSavedWhales] = useState<WhaleTransaction[]>([]);

  // Load saved whales on component mount
  useEffect(() => {
    setSavedWhales(getSavedWhaleTransactions());
  }, []);

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['whaleBlocks'],
    queryFn: () => getLatestBlocks(30),
    refetchInterval: 2000, // Refresh every 2 seconds
    staleTime: 0, // Data is immediately stale
    gcTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always fetch fresh data on mount
  });

  const whaleTransactions = useMemo(() => {
    if (!blocks || blocks.length === 0) return [];

    const whales: WhaleTransaction[] = [];

    blocks.forEach((block) => {
      if (!block || !Array.isArray(block.transactions)) return;

      block.transactions.forEach((tx: any) => {
        const valueInEth = weiToEth(tx.value);

        if (valueInEth >= minValue) {
          let size: 'large' | 'huge' | 'mega' = 'large';
          if (valueInEth >= 100000) size = 'mega';
          else if (valueInEth >= 50000) size = 'huge';

          whales.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            valueInEth,
            timestamp: parseInt(block.timestamp, 16),
            blockNumber: block.number,
            size,
          });
        }
      });
    });

    return whales.sort((a, b) => b.valueInEth - a.valueInEth);
  }, [blocks, minValue]);

  // Combine live whales with saved whales when showing saved whales
  const displayWhales = showSavedWhales ? [...savedWhales, ...whaleTransactions] : whaleTransactions;

  // Save a whale transaction
  const handleSaveWhale = (whale: WhaleTransaction) => {
    saveWhaleTransaction(whale);
    // Update the saved whales state
    setSavedWhales(getSavedWhaleTransactions());
  };

  // Clear all saved whales
  const handleClearSavedWhales = () => {
    clearSavedWhaleTransactions();
    setSavedWhales([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 sm:p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Whale Tracker</h1>
        </div>
        <p className="text-purple-100 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
          Track large transactions in real-time on Hyperliquid
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">{whaleTransactions.length}</div>
            <div className="text-sm text-purple-100">Live Whale Transactions</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">
              {whaleTransactions.reduce((sum, tx) => sum + tx.valueInEth, 0).toFixed(2)}
            </div>
            <div className="text-sm text-purple-100">Total Volume (ETH)</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">
              {whaleTransactions.length > 0 
                ? (whaleTransactions.reduce((sum, tx) => sum + tx.valueInEth, 0) / whaleTransactions.length).toFixed(2)
                : 0}
            </div>
            <div className="text-sm text-purple-100">Avg Transaction (ETH)</div>
          </div>
        </div>
      </div>

      {/* Filter and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Value:
              </label>
              <select
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value={10000}>Large (&gt; 10,000 ETH)</option>
                <option value={50000}>Huge (&gt; 50,000 ETH)</option>
                <option value={100000}>Mega (&gt; 100,000 ETH)</option>
                <option value={1000}>All (&gt; 1,000 ETH)</option>
              </select>
            </div>
            
            {/* Saved Whales Toggle */}
            <button
              onClick={() => setShowSavedWhales(!showSavedWhales)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showSavedWhales 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Save className="w-4 h-4" />
              {showSavedWhales ? 'Showing Saved Whales' : 'Show Saved Whales'}
            </button>
          </div>
          
          {/* Clear Saved Whales Button */}
          {savedWhales.length > 0 && (
            <button
              onClick={handleClearSavedWhales}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear Saved ({savedWhales.length})
            </button>
          )}
        </div>
        
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {showSavedWhales 
            ? `${savedWhales.length} saved whales + ${whaleTransactions.length} live whales` 
            : `${whaleTransactions.length} live whales found`}
        </div>
      </div>

      {/* Whale Transactions Table */}
      {displayWhales.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tx Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayWhales.map((tx) => {
                  const isSaved = tx.savedAt !== undefined;
                  return (
                    <tr 
                      key={tx.hash} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" title={tx.size}>
                          {tx.size === 'mega' ? 'MEGA' : tx.size === 'huge' ? 'HUGE' : 'LARGE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`/tx/${tx.hash}`}
                          className="font-mono text-sm text-blue-600 hover:underline"
                        >
                          {truncateHash(tx.hash)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`/address/${tx.from}`}
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {truncateHash(tx.from)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {tx.to ? (
                          <Link 
                            href={`/address/${tx.to}`}
                            className="font-mono text-xs text-blue-600 hover:underline"
                          >
                            {truncateHash(tx.to)}
                          </Link>
                        ) : (
                          <span className="text-gray-500 text-xs">Contract Creation</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-green-600">
                            {formatEth(tx.value, 2)} ETH
                          </span>
                          <span className="text-xs text-gray-500">
                            ${(tx.valueInEth * 3000).toLocaleString()} USD
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getRelativeTime(tx.timestamp)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!isSaved ? (
                          <button
                            onClick={() => handleSaveWhale(tx)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">Saved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
          <Filter className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg sm:text-xl font-bold mb-2">No Whale Transactions Found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Try lowering the minimum value filter to see more transactions
          </p>
        </div>
      )}
    </div>
  );
}