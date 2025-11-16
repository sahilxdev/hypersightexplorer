import axios from 'axios';

// Dynamic RPC URL that can be updated based on network selection
// On server-side (API routes), use LAVA_RPC_URL
// On client-side, use NEXT_PUBLIC_LAVA_RPC_URL
let currentRpcUrl = typeof window === 'undefined'
  ? (process.env.LAVA_RPC_URL || process.env.NEXT_PUBLIC_LAVA_RPC_URL || '')
  : (process.env.NEXT_PUBLIC_LAVA_RPC_URL || '');

export function setRpcUrl(url: string) {
  currentRpcUrl = url;
}

export function getRpcUrl() {
  // Check if browser and if window has updated URL
  if (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_LAVA_RPC_URL) {
    return (window as any).NEXT_PUBLIC_LAVA_RPC_URL;
  }
  // On server-side, prioritize server env var
  if (typeof window === 'undefined' && process.env.LAVA_RPC_URL) {
    return process.env.LAVA_RPC_URL;
  }
  return currentRpcUrl;
}

function getRpcClient() {
  return axios.create({
    baseURL: getRpcUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

let requestId = 1;

async function rpcCall(method: string, params: any[] = []) {
  try {
    const rpcClient = getRpcClient();
    const response = await rpcClient.post('', {
      jsonrpc: '2.0',
      method,
      params,
      id: requestId++,
    });
    return response.data.result;
  } catch (error) {
    console.error(`RPC Error for ${method}:`, error);
    throw error;
  }
}

// Block Methods
export async function getLatestBlockNumber(): Promise<number> {
  const result = await rpcCall('eth_blockNumber');
  return parseInt(result, 16);
}

export async function getBlockByNumber(blockNumber: number | string, fullTransactions = true) {
  const blockNum = typeof blockNumber === 'number' ? `0x${blockNumber.toString(16)}` : blockNumber;
  return await rpcCall('eth_getBlockByNumber', [blockNum, fullTransactions]);
}

export async function getBlockByHash(blockHash: string, fullTransactions = true) {
  return await rpcCall('eth_getBlockByHash', [blockHash, fullTransactions]);
}

// Transaction Methods
export async function getTransaction(txHash: string) {
  return await rpcCall('eth_getTransactionByHash', [txHash]);
}

export async function getTransactionReceipt(txHash: string) {
  return await rpcCall('eth_getTransactionReceipt', [txHash]);
}

export async function getTransactionCount(address: string, blockTag = 'latest') {
  const result = await rpcCall('eth_getTransactionCount', [address, blockTag]);
  return parseInt(result, 16);
}

// Account Methods
export async function getBalance(address: string, blockTag = 'latest') {
  const result = await rpcCall('eth_getBalance', [address, blockTag]);
  return result;
}

export async function getCode(address: string, blockTag = 'latest') {
  return await rpcCall('eth_getCode', [address, blockTag]);
}

// Gas Methods
export async function getGasPrice() {
  const result = await rpcCall('eth_gasPrice');
  return parseInt(result, 16);
}

export async function estimateGas(transaction: any) {
  const result = await rpcCall('eth_estimateGas', [transaction]);
  return parseInt(result, 16);
}

// Network Methods
export async function getChainId() {
  const result = await rpcCall('eth_chainId');
  return parseInt(result, 16);
}

export async function isSyncing() {
  return await rpcCall('eth_syncing');
}

// Utility function to get multiple blocks at once
export async function getLatestBlocks(count: number = 10) {
  const latestBlockNumber = await getLatestBlockNumber();
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    promises.push(getBlockByNumber(latestBlockNumber - i));
  }
  
  return Promise.all(promises);
}

// Get recent transactions from latest blocks
export async function getRecentTransactions(count: number = 20) {
  const latestBlocks = await getLatestBlocks(5);
  const transactions: any[] = [];
  
  for (const block of latestBlocks) {
    if (block && block.transactions) {
      transactions.push(...block.transactions);
      if (transactions.length >= count) break;
    }
  }
  
  return transactions.slice(0, count);
}
