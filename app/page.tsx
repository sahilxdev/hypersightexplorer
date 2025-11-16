'use client';

import { useQuery } from '@tanstack/react-query';
import { getLatestBlocks, getRecentTransactions } from '@/lib/lavaRpc';
import BlockCard from '@/components/BlockCard';
import TransactionCard from '@/components/TransactionCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Activity, Blocks, ArrowRightLeft } from 'lucide-react';
import { REFRESH_INTERVAL } from '@/lib/constants';

export default function Home() {
  const { data: blocks, isLoading: blocksLoading, error: blocksError } = useQuery({
    queryKey: ['latestBlocks'],
    queryFn: () => getLatestBlocks(9),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: transactions, isLoading: txLoading, error: txError } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => getRecentTransactions(9),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Hyperliquid Explorer</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Real-time blockchain explorer powered by Lava Network's high-performance RPC API
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-secondary rounded-lg p-4">
            <div className="text-2xl font-bold">{blocks?.length || 0}+</div>
            <div className="text-sm text-muted-foreground">Latest Blocks</div>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <div className="text-2xl font-bold">{transactions?.length || 0}+</div>
            <div className="text-sm text-muted-foreground">Recent Transactions</div>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <div className="text-2xl font-bold">Live</div>
            <div className="text-sm text-muted-foreground">Real-time Updates</div>
          </div>
        </div>
      </div>

      {/* Latest Blocks */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Blocks className="w-5 h-5 text-primary" />
            Latest Blocks
          </h2>
          <span className="text-xs text-muted-foreground">Updates every 2 seconds</span>
        </div>

        {blocksLoading ? (
          <LoadingSkeleton />
        ) : blocksError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            Failed to load blocks. Please check your connection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks?.filter(block => block && block.hash).map((block) => (
              <BlockCard key={block.hash} block={block} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Recent Transactions
          </h2>
        </div>

        {txLoading ? (
          <LoadingSkeleton />
        ) : txError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            Failed to load transactions. Please check your connection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions?.filter(tx => tx && tx.hash).map((tx) => (
              <TransactionCard key={tx.hash} transaction={tx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}