'use client';

import { useQuery } from '@tanstack/react-query';
import { getLatestBlocks } from '@/lib/lavaRpc';
import { weiToEth, hexToDecimal } from '@/lib/utils';
import StatsCard from '@/components/StatsCard';
import { TrendingUp, Activity, DollarSign, Zap, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useMemo } from 'react';

export default function AnalyticsPage() {
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['analyticsBlocks'],
    queryFn: () => getLatestBlocks(50),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const analytics = useMemo(() => {
    if (!blocks || blocks.length === 0) return null;

    let totalVolume = 0;
    let totalTxCount = 0;
    let totalGasUsed = 0;
    const addressActivity: { [key: string]: { count: number; volume: number } } = {};
    const blockData: any[] = [];

    blocks.forEach((block) => {
      if (!block || !block.transactions) return;

      const blockNum = hexToDecimal(block.number);
      const blockTxCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
      const gasUsed = hexToDecimal(block.gasUsed);
      
      totalTxCount += blockTxCount;
      totalGasUsed += gasUsed;

      let blockVolume = 0;

      if (Array.isArray(block.transactions)) {
        block.transactions.forEach((tx: any) => {
          const value = weiToEth(tx.value);
          totalVolume += value;
          blockVolume += value;

          // Track sender activity
          if (!addressActivity[tx.from]) {
            addressActivity[tx.from] = { count: 0, volume: 0 };
          }
          addressActivity[tx.from].count++;
          addressActivity[tx.from].volume += value;

          // Track receiver activity
          if (tx.to) {
            if (!addressActivity[tx.to]) {
              addressActivity[tx.to] = { count: 0, volume: 0 };
            }
            addressActivity[tx.to].count++;
            addressActivity[tx.to].volume += value;
          }
        });
      }

      blockData.push({
        block: blockNum,
        txCount: blockTxCount,
        volume: parseFloat(blockVolume.toFixed(2)),
        gasUsed,
      });
    });

    // Get top addresses
    const topAddresses = Object.entries(addressActivity)
      .map(([address, data]) => ({
        address,
        count: data.count,
        volume: data.volume,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate average block time
    let totalBlockTime = 0;
    for (let i = 1; i < blocks.length; i++) {
      const timeDiff = hexToDecimal(blocks[i - 1].timestamp) - hexToDecimal(blocks[i].timestamp);
      totalBlockTime += Math.abs(timeDiff);
    }
    const avgBlockTime = blocks.length > 1 ? totalBlockTime / (blocks.length - 1) : 0;

    return {
      totalVolume,
      totalTxCount,
      totalGasUsed,
      avgBlockTime,
      avgTxPerBlock: totalTxCount / blocks.length,
      topAddresses,
      blockData: blockData.reverse(), // Most recent first
      uniqueAddresses: Object.keys(addressActivity).length,
    };
  }, [blocks]);

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time insights from the last 50 blocks on Hyperliquid
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Volume"
          value={`${analytics.totalVolume.toFixed(2)} ETH`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          description="Last 50 blocks"
        />
        <StatsCard
          title="Total Transactions"
          value={analytics.totalTxCount.toLocaleString()}
          icon={<Activity className="w-5 h-5 text-primary" />}
          description={`Avg ${analytics.avgTxPerBlock.toFixed(1)} per block`}
        />
        <StatsCard
          title="Unique Addresses"
          value={analytics.uniqueAddresses.toLocaleString()}
          icon={<Users className="w-5 h-5 text-primary" />}
          description="Active participants"
        />
        <StatsCard
          title="Avg Block Time"
          value={`${analytics.avgBlockTime.toFixed(1)}s`}
          icon={<Zap className="w-5 h-5 text-primary" />}
          description="Average confirmation time"
        />
      </div>

      {/* Transaction Volume Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction Volume by Block</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.blockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="block" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Block Number', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Volume (ETH)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Count Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Transactions Per Block</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.blockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="block" 
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Bar 
              dataKey="txCount" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Addresses */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Top Active Addresses</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Transactions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Volume (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topAddresses.map((addr, index) => (
                <tr key={addr.address} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <span className="font-medium">{index + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a 
                      href={`/address/${addr.address}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {addr.address.slice(0, 10)}...{addr.address.slice(-8)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{addr.count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{addr.volume.toFixed(4)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}