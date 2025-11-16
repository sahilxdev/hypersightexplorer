'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Network = 'mainnet' | 'testnet';

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  rpcUrl: string;
}

const RPC_ENDPOINTS = {
  mainnet: 'https://g.w.lavanet.xyz:443/gateway/hyperliquid/rpc-http/f5a7962fe641f76942da3d2c99cbd820',
  testnet: 'https://g.w.lavanet.xyz:443/gateway/hyperliquidt/rpc-http/f5a7962fe641f76942da3d2c99cbd820',
};

const NetworkContext = createContext<NetworkContextType>({
  network: 'mainnet',
  setNetwork: () => {},
  rpcUrl: RPC_ENDPOINTS.mainnet,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<Network>('mainnet');

  useEffect(() => {
    // Load saved network preference
    const saved = localStorage.getItem('network') as Network;
    if (saved && (saved === 'mainnet' || saved === 'testnet')) {
      setNetworkState(saved);
    }
  }, []);

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork);
    localStorage.setItem('network', newNetwork);
    // Update environment variable for RPC calls
    if (typeof window !== 'undefined') {
      (window as any).NEXT_PUBLIC_LAVA_RPC_URL = RPC_ENDPOINTS[newNetwork];
    }
  };

  const rpcUrl = RPC_ENDPOINTS[network];

  return (
    <NetworkContext.Provider value={{ network, setNetwork, rpcUrl }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
