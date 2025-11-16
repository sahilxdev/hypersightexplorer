'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DiagnosticPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runDiagnostics() {
      const rpcUrl = process.env.NEXT_PUBLIC_LAVA_RPC_URL || '';
      const diagnostics: any = {
        rpcUrl: rpcUrl ? 'Configured' : 'NOT CONFIGURED',
        rpcUrlPreview: rpcUrl ? rpcUrl.substring(0, 50) + '...' : 'Missing',
      };

      try {
        // Test 1: Get latest block number
        const blockNumResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          }),
        });
        const blockNumData = await blockNumResponse.json();
        diagnostics.latestBlockNumber = blockNumData.result
          ? parseInt(blockNumData.result, 16)
          : 'ERROR: ' + JSON.stringify(blockNumData);

        // Test 2: Get chain ID
        const chainIdResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 2,
          }),
        });
        const chainIdData = await chainIdResponse.json();
        diagnostics.chainId = chainIdData.result
          ? parseInt(chainIdData.result, 16)
          : 'ERROR: ' + JSON.stringify(chainIdData);

        // Test 3: Get latest block with full details
        if (blockNumData.result) {
          const blockResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBlockByNumber',
              params: [blockNumData.result, true],
              id: 3,
            }),
          });
          const blockData = await blockResponse.json();

          if (blockData.result) {
            diagnostics.latestBlock = {
              number: parseInt(blockData.result.number, 16),
              hash: blockData.result.hash,
              transactions: Array.isArray(blockData.result.transactions)
                ? blockData.result.transactions.length
                : typeof blockData.result.transactions,
              gasUsed: blockData.result.gasUsed,
              timestamp: new Date(parseInt(blockData.result.timestamp, 16) * 1000).toLocaleString(),
            };

            // If there are transactions, grab the first one
            if (Array.isArray(blockData.result.transactions) && blockData.result.transactions.length > 0) {
              const firstTx = blockData.result.transactions[0];
              diagnostics.sampleTransaction = {
                hash: firstTx.hash,
                from: firstTx.from,
                to: firstTx.to,
                value: firstTx.value,
                type: typeof firstTx,
              };
            } else {
              diagnostics.sampleTransaction = 'NO TRANSACTIONS IN LATEST BLOCK';
            }
          } else {
            diagnostics.latestBlock = 'ERROR: ' + JSON.stringify(blockData);
          }
        }

        // Test 4: Try to get a few more blocks to find transactions
        diagnostics.blockScan = [];
        if (blockNumData.result) {
          const latestNum = parseInt(blockNumData.result, 16);
          for (let i = 0; i < 10; i++) {
            const blockNum = '0x' + (latestNum - i).toString(16);
            const blockResponse = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBlockByNumber',
                params: [blockNum, true],
                id: 4 + i,
              }),
            });
            const blockData = await blockResponse.json();

            if (blockData.result) {
              const txCount = Array.isArray(blockData.result.transactions)
                ? blockData.result.transactions.length
                : 0;

              diagnostics.blockScan.push({
                number: parseInt(blockData.result.number, 16),
                txCount: txCount,
                hasTransactions: txCount > 0,
              });

              // If we found a block with transactions, grab one
              if (txCount > 0 && !diagnostics.realTransaction) {
                diagnostics.realTransaction = blockData.result.transactions[0];
              }
            }
          }
        }

      } catch (error: any) {
        diagnostics.error = error.message;
      }

      setResults(diagnostics);
      setLoading(false);
    }

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Running comprehensive diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔍 Complete RPC Diagnostic</h1>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* RPC Configuration */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">1. RPC Configuration</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Status: </span>
            <span className={results.rpcUrl === 'Configured' ? 'text-green-600' : 'text-red-600'}>
              {results.rpcUrl}
            </span>
          </div>
          <div>
            <span className="font-semibold">URL Preview: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded">{results.rpcUrlPreview}</code>
          </div>
          <div>
            <span className="font-semibold">Chain ID: </span>
            <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
              {results.chainId}
            </code>
          </div>
        </div>
      </div>

      {/* Latest Block Info */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">2. Latest Block Information</h2>
        {results.latestBlockNumber && (
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Block Number: </span>
              <code className="text-lg bg-secondary px-3 py-1 rounded font-mono">
                #{results.latestBlockNumber}
              </code>
            </div>
            {results.latestBlock && typeof results.latestBlock === 'object' && (
              <>
                <div>
                  <span className="font-semibold">Block Hash: </span>
                  <code className="text-xs bg-secondary px-2 py-1 rounded break-all font-mono">
                    {results.latestBlock.hash}
                  </code>
                </div>
                <div>
                  <span className="font-semibold">Transaction Count: </span>
                  <code className={`text-lg px-3 py-1 rounded font-mono ${
                    results.latestBlock.transactions === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {results.latestBlock.transactions}
                  </code>
                </div>
                <div>
                  <span className="font-semibold">Timestamp: </span>
                  <code className="text-sm bg-secondary px-2 py-1 rounded">
                    {results.latestBlock.timestamp}
                  </code>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Block Scan Results */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">3. Block Scan (Last 10 Blocks)</h2>
        {results.blockScan && results.blockScan.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-2 text-left">Block #</th>
                  <th className="px-4 py-2 text-left">Transactions</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.blockScan.map((block: any, idx: number) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-4 py-2 font-mono">#{block.number}</td>
                    <td className="px-4 py-2">
                      <span className={block.txCount === 0 ? 'text-red-600' : 'text-green-600'}>
                        {block.txCount}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {block.hasTransactions ? '✅ Has Txs' : '❌ Empty'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No block scan data available</p>
        )}
      </div>

      {/* Real Transaction Found */}
      {results.realTransaction && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-200">
            ✅ REAL TRANSACTION FOUND!
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Hash: </span>
              <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded break-all">
                {results.realTransaction.hash}
              </code>
            </div>
            <div>
              <span className="font-semibold">From: </span>
              <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded break-all">
                {results.realTransaction.from}
              </code>
            </div>
            <div>
              <span className="font-semibold">To: </span>
              <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded break-all">
                {results.realTransaction.to || 'Contract Creation'}
              </code>
            </div>
            <div>
              <span className="font-semibold">Value: </span>
              <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded">
                {results.realTransaction.value}
              </code>
            </div>
            <div className="mt-4">
              <Link
                href={`/tx/${results.realTransaction.hash}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                🎯 VIEW THIS REAL TRANSACTION
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* No Transactions Warning */}
      {results.blockScan && results.blockScan.every((b: any) => b.txCount === 0) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-800 dark:text-red-200">
            ⚠️ NO TRANSACTIONS FOUND
          </h2>
          <p className="mb-4">The last 10 blocks have ZERO transactions. This means:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Hyperliquid network has very low activity right now</li>
            <li>You might be connected to a testnet with no activity</li>
            <li>The RPC endpoint might be for a different Hyperliquid network</li>
            <li>Hyperliquid might use a different transaction structure</li>
          </ul>
          <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded">
            <p className="font-semibold">💡 Recommendation:</p>
            <p>Check with Lava Network to verify this is the correct RPC URL for Hyperliquid MAINNET with active transactions.</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {results.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2 text-red-600">Error</h2>
          <code className="text-sm bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded block">
            {results.error}
          </code>
        </div>
      )}

      {/* Raw Debug Data */}
      <details className="bg-card border rounded-lg p-6">
        <summary className="text-xl font-bold cursor-pointer">Raw Debug Data (Click to expand)</summary>
        <pre className="mt-4 text-xs bg-secondary p-4 rounded overflow-x-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </details>
    </div>
  );
}
