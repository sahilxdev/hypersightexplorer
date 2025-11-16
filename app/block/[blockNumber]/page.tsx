'use client';

import { useQuery } from '@tanstack/react-query';
import { getBlockByNumber, getTransactionCount } from '@/lib/lavaRpc';
import { hexToDecimal, formatEth, truncateHash } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';
import Link from 'next/link';
import { ArrowLeft, Box, Hash, Clock, User, Zap, Database } from 'lucide-react';
import { formatTimestamp, getRelativeTime } from '@/lib/utils';

export default function BlockPage({ params }: { params: { blockNumber: string } }) {
  const { blockNumber } = params;

  const { data: block, isLoading, error } = useQuery({
    queryKey: ['block', blockNumber],
    queryFn: () => getBlockByNumber(parseInt(blockNumber)),
    staleTime: 0,
    gcTime: 0,
  });

  // Get transaction count
  const txCount = Array.isArray(block?.transactions) ? block.transactions.length : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
        <h2 className="text-xl font-bold mb-2">Block Not Found</h2>
        <p>Could not find block #{blockNumber}. Please check the block number and try again.</p>
        <Link href="/" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Block Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Box className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Block #{hexToDecimal(block.number)}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getRelativeTime(block.timestamp)} • {formatTimestamp(block.timestamp)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="md:col-span-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Block Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm break-all">{block.hash}</span>
                <CopyButton text={block.hash} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Parent Hash</span>
              <div className="flex items-center gap-2">
                <Link 
                  href={`/block/${hexToDecimal(block.number) - 1}`}
                  className="font-mono text-sm break-all text-blue-600 dark:text-blue-400 hover:underline"
                  title="Click to view previous block"
                >
                  {truncateHash(block.parentHash, 20, 20)}
                </Link>
                <CopyButton text={block.parentHash} />
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                  (Click to view Block #{hexToDecimal(block.number) - 1})
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Miner</span>
              <div className="flex items-center gap-2">
                {block.miner === '0x0000000000000000000000000000000000000000' ? (
                  <div className="flex flex-col">
                    <span className="font-mono text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">
                      {truncateHash(block.miner)}
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Hyperliquid uses Proof of Stake (no traditional miner)
                    </span>
                  </div>
                ) : (
                  <>
                    <Link href={`/address/${block.miner}`} className="font-mono text-sm text-blue-600 hover:underline">
                      {truncateHash(block.miner)}
                    </Link>
                    <CopyButton text={block.miner} />
                  </>
                )}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Transactions</span>
              <span className="font-semibold text-green-600">{txCount} transactions</span>
            </div>

            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Gas Used</span>
              <span className="font-semibold">{hexToDecimal(block.gasUsed).toLocaleString()}</span>
            </div>

            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Gas Limit</span>
              <span className="font-semibold">{hexToDecimal(block.gasLimit).toLocaleString()}</span>
            </div>

            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Block Size</span>
              <span className="font-semibold">{hexToDecimal(block.size).toLocaleString()} bytes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {txCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Transactions ({txCount})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tx Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(block.transactions) && block.transactions.map((tx: any) => (
                  <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-blue-600 hover:underline">
                        {truncateHash(tx.hash)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/address/${tx.from}`} className="font-mono text-sm text-blue-600 hover:underline">
                        {truncateHash(tx.from)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {tx.to ? (
                        <Link href={`/address/${tx.to}`} className="font-mono text-sm text-blue-600 hover:underline">
                          {truncateHash(tx.to)}
                        </Link>
                      ) : (
                        <span className="text-gray-500 text-sm">Contract Creation</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{formatEth(tx.value)} ETH</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}