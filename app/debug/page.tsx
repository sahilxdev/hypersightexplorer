'use client';

import { useEffect, useState } from 'react';
import { getLatestBlocks, getLatestBlockNumber, getChainId } from '@/lib/lavaRpc';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugData() {
      try {
        setLoading(true);

        // Get RPC URL
        const rpcUrl = process.env.NEXT_PUBLIC_LAVA_RPC_URL || 'Not configured';

        // Get chain ID
        const chainId = await getChainId();

        // Get latest block number
        const latestBlockNum = await getLatestBlockNumber();

        // Get latest blocks with full details
        const blocks = await getLatestBlocks(3);

        // Count transactions
        let totalTxs = 0;
        blocks.forEach(block => {
          if (block && Array.isArray(block.transactions)) {
            totalTxs += block.transactions.length;
          }
        });

        setDebugInfo({
          rpcUrl,
          chainId,
          latestBlockNum,
          blocks,
          totalTxs,
          sampleBlock: blocks[0] || null,
        });

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLoading(false);
      }
    }

    fetchDebugData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading debug information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2 text-red-600">Debug Error</h2>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link href="/" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debug Information</h1>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* RPC Configuration */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">RPC Configuration</h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">RPC URL: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded">
              {debugInfo?.rpcUrl ? '✅ Configured' : '❌ Not configured'}
            </code>
          </div>
          <div>
            <span className="font-semibold">Chain ID: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded">{debugInfo?.chainId}</code>
          </div>
          <div>
            <span className="font-semibold">Latest Block Number: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded">#{debugInfo?.latestBlockNum}</code>
          </div>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Transaction Statistics</h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Blocks Fetched: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded">{debugInfo?.blocks?.length || 0}</code>
          </div>
          <div>
            <span className="font-semibold">Total Transactions in Last 3 Blocks: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded">{debugInfo?.totalTxs || 0}</code>
          </div>
          {debugInfo?.totalTxs === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ No transactions found!</strong> This could mean:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Hyperliquid has very low activity right now</li>
                <li>You're on testnet with no activity</li>
                <li>The RPC endpoint might be incorrect</li>
                <li>Transactions are structured differently than expected</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Sample Block Data */}
      {debugInfo?.sampleBlock && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Sample Block Data</h2>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Block Number: </span>
              <code className="text-sm bg-secondary px-2 py-1 rounded">
                {debugInfo.sampleBlock.number}
              </code>
            </div>
            <div>
              <span className="font-semibold">Block Hash: </span>
              <code className="text-xs bg-secondary px-2 py-1 rounded break-all">
                {debugInfo.sampleBlock.hash}
              </code>
            </div>
            <div>
              <span className="font-semibold">Transaction Count: </span>
              <code className="text-sm bg-secondary px-2 py-1 rounded">
                {Array.isArray(debugInfo.sampleBlock.transactions)
                  ? debugInfo.sampleBlock.transactions.length
                  : 'Not an array'}
              </code>
            </div>

            {/* Show sample transaction if exists */}
            {Array.isArray(debugInfo.sampleBlock.transactions) &&
             debugInfo.sampleBlock.transactions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Sample Transaction:</h3>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Hash: </span>
                      <code className="text-xs break-all">
                        {debugInfo.sampleBlock.transactions[0].hash}
                      </code>
                    </div>
                    <div>
                      <span className="font-semibold">From: </span>
                      <code className="text-xs break-all">
                        {debugInfo.sampleBlock.transactions[0].from}
                      </code>
                    </div>
                    <div>
                      <span className="font-semibold">To: </span>
                      <code className="text-xs break-all">
                        {debugInfo.sampleBlock.transactions[0].to || 'Contract Creation'}
                      </code>
                    </div>
                    <div>
                      <span className="font-semibold">Value: </span>
                      <code className="text-xs">
                        {debugInfo.sampleBlock.transactions[0].value}
                      </code>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/tx/${debugInfo.sampleBlock.transactions[0].hash}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        View This Transaction
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Block Data */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Raw Block Data (First Block)</h2>
        <div className="bg-secondary rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs">
            {JSON.stringify(debugInfo?.sampleBlock, null, 2)}
          </pre>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">Recommendations</h2>
        <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
          <li>If you see 0 transactions, try switching networks (Mainnet/Testnet)</li>
          <li>Check if the RPC URL in .env.local is correct for Hyperliquid</li>
          <li>Verify you're connected to the right Hyperliquid network</li>
          <li>Try clicking "View This Transaction" button above if available</li>
        </ul>
      </div>
    </div>
  );
}
