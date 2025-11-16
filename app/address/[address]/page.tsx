'use client';

import { useQuery } from '@tanstack/react-query';
import { getBalance, getTransactionCount } from '@/lib/lavaRpc';
import { formatEth, truncateHash } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';

export default function AddressPage({ params }: { params: { address: string } }) {
  const { address } = params;
  
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance', address],
    queryFn: () => getBalance(address),
  });

  const { data: txCount, isLoading: txCountLoading } = useQuery({
    queryKey: ['txCount', address],
    queryFn: () => getTransactionCount(address),
  });

  const isLoading = balanceLoading || txCountLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

      {/* Address Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Address Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm break-all">{address}</span>
          <CopyButton text={address} />
        </div>
      </div>

      {/* Balance & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">Balance</h2>
          <p className="text-3xl font-bold text-blue-600">
            {balance ? formatEth(balance, 6) : '0'} ETH
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">Transactions</h2>
          <p className="text-3xl font-bold text-green-600">
            {txCount !== undefined ? txCount.toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Full transaction history for addresses will be available in a future update.
          Currently showing balance and transaction count only.
        </p>
      </div>
    </div>
  );
}