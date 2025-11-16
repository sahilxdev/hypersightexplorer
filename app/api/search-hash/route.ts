import { NextRequest, NextResponse } from 'next/server';
import { getTransaction, getBlockByHash } from '@/lib/lavaRpc';

export async function POST(request: NextRequest) {
  try {
    const { hash } = await request.json();
    
    if (!hash || hash.length !== 66 || !hash.startsWith('0x')) {
      return NextResponse.json({ type: 'unknown' }, { status: 400 });
    }

    // First try as transaction hash
    try {
      const tx = await getTransaction(hash);
      if (tx) {
        return NextResponse.json({ type: 'transaction', data: tx });
      }
    } catch (error) {
      console.log('Not a transaction hash, trying block hash...');
    }

    // If not found as transaction, try as block hash
    try {
      const block = await getBlockByHash(hash, false);
      if (block) {
        const blockNumber = parseInt(block.number, 16);
        return NextResponse.json({ 
          type: 'block', 
          blockNumber,
          data: block 
        });
      }
    } catch (error) {
      console.log('Not a block hash either');
    }

    // Not found as either
    return NextResponse.json({ type: 'not_found' }, { status: 404 });
    
  } catch (error) {
    console.error('Search hash error:', error);
    return NextResponse.json({ 
      type: 'error',
      message: 'Failed to search hash' 
    }, { status: 500 });
  }
}
