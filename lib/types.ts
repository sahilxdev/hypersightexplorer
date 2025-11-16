export interface Block {
  number: string;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  transactions: Transaction[] | string[];
  uncles: string[];
}

export interface Transaction {
  hash: string;
  nonce: string;
  blockHash: string | null;
  blockNumber: string | null;
  transactionIndex: string | null;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  v?: string;
  r?: string;
  s?: string;
  type?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  gasUsed: string;
  contractAddress: string | null;
  logs: Log[];
  logsBloom: string;
  type: string;
  status: string;
}

export interface Log {
  removed: boolean;
  logIndex: string;
  transactionIndex: string;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  address: string;
  data: string;
  topics: string[];
}

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  valueInEth: number;
  timestamp: number;
  blockNumber: string;
  size: 'large' | 'huge' | 'mega';
  savedAt?: number; // Add this property for tracking when the whale was saved
}

export interface AnalyticsData {
  totalVolume: number;
  transactionCount: number;
  averageGasPrice: number;
  averageBlockTime: number;
  topAddresses: { address: string; count: number; volume: number }[];
}