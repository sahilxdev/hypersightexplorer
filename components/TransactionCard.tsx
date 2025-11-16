'use client';

import Link from 'next/link';
import { Transaction } from '@/lib/types';
import { truncateHash, formatEth, getRelativeTime, hexToDecimal, copyToClipboard } from '@/lib/utils';
import { ArrowRight, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

interface TransactionCardProps {
  transaction: Transaction;
  showStatus?: boolean;
}

export default function TransactionCard({ transaction, showStatus = false }: TransactionCardProps) {
  const [copied, setCopied] = useState(false);
  const value = formatEth(transaction.value);
  const blockNumber = transaction.blockNumber ? hexToDecimal(transaction.blockNumber) : 'Pending';

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(transaction.hash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Link href={`/tx/${transaction.hash}`}>
      <div className="card card-hover p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono text-muted-foreground">Tx</span>
            <span className="font-mono text-sm text-primary truncate" title={transaction.hash}>
              {truncateHash(transaction.hash, 10, 8)}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-secondary rounded transition-colors"
              title="Copy full transaction hash"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          </div>
          {showStatus && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              Success
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs block mb-1">From</span>
            <span className="font-mono text-xs">{truncateHash(transaction.from)}</span>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div>
            <span className="text-muted-foreground text-xs block mb-1">To</span>
            <span className="font-mono text-xs">
              {transaction.to ? truncateHash(transaction.to) : 'Contract Creation'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border text-sm">
          <span className="text-muted-foreground">
            Value: <span className="font-semibold text-foreground">{value} ETH</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Block: <span className="text-primary">#{blockNumber}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}