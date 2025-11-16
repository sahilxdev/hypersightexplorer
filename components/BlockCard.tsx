'use client';

import Link from 'next/link';
import { Block } from '@/lib/types';
import { hexToDecimal, formatTimestamp, getRelativeTime, truncateHash } from '@/lib/utils';
import { Clock, Hash, Box, Zap } from 'lucide-react';

interface BlockCardProps {
  block: Block;
}

export default function BlockCard({ block }: BlockCardProps) {
  const blockNumber = hexToDecimal(block.number);
  const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
  const timestamp = formatTimestamp(block.timestamp);
  const relativeTime = getRelativeTime(block.timestamp);

  return (
    <Link href={`/block/${blockNumber}`}>
      <div className="card card-hover p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary rounded-md">
              <Box className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-semibold">
              #{blockNumber}
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {relativeTime}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Hash:
            </span>
            <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">
              {truncateHash(block.hash)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Transactions:</span>
            <span className="font-semibold text-primary bg-secondary px-2 py-1 rounded">
              {txCount} txns
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Gas Used:
            </span>
            <span className="font-mono text-xs">{hexToDecimal(block.gasUsed).toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs pt-2 border-t border-border">
            <span className="text-muted-foreground">{timestamp}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}