# Hyperliquid Blockchain Explorer

A real-time blockchain explorer for Hyperliquid network powered by Lava Network's high-performance RPC infrastructure. Built for the HyperEVM Hackathon 2025.

## Technical Overview

This application provides comprehensive visibility into the Hyperliquid blockchain through a modern web interface. It fetches live blockchain data via Lava Network's RPC endpoints and presents it in an intuitive, responsive dashboard.

### Core Architecture

**Frontend Stack:**
- Next.js 14 with App Router (React 18)
- TypeScript for type safety
- TanStack Query (React Query) for data fetching and caching
- Tailwind CSS for styling

**Data Layer:**
- Lava Network RPC API (JSON-RPC 2.0 protocol)
- Real-time data fetching with automatic refresh intervals
- Client-side caching and state management

**Key Technical Features:**
- Server-side rendering (SSR) for initial page loads
- Client-side hydration for interactive features
- Optimistic UI updates with React Query
- Context API for global state (theme, network selection)

## Features

### 1. Block Explorer
- Real-time display of latest blocks
- Automatic refresh every 5 seconds
- Block details including hash, parent hash, miner, gas usage, and transactions
- Navigation between blocks via parent hash links

### 2. Transaction Explorer
- Live transaction feed with auto-refresh
- Transaction status verification (success/failed)
- Detailed gas metrics (limit, used, price)
- Input data display for contract interactions

### 3. Intelligent Search System
The search functionality implements pattern detection to identify:
- Block numbers (pure digits)
- Transaction hashes (66-character hex strings with 0x prefix)
- Block hashes (66-character hex strings with 0x prefix)
- Addresses (42-character hex strings with 0x prefix)

**Smart Hash Resolution:**
When a 66-character hash is searched, the system:
1. First attempts to resolve it as a transaction hash via `eth_getTransactionByHash`
2. If not found, falls back to block hash lookup via `eth_getBlockByHash`
3. Redirects to the appropriate detail page based on the result

### 4. Network Switching
- Support for both Mainnet and Testnet
- Dynamic RPC endpoint switching
- Persistent network selection via localStorage
- No page reload required for network changes

### 5. Theme System
- Dark and light mode support
- Lava Network inspired color scheme (purple, pink, orange gradients)
- Persistent theme selection
- CSS variables for dynamic theming

### 6. Analytics Dashboard
- Network statistics aggregation
- Transaction volume analysis
- Gas price trends
- Active addresses tracking

### 7. Whale Tracker
- Real-time monitoring of large transactions
- Configurable thresholds:
  - Large: 10,000+ ETH
  - Huge: 50,000+ ETH
  - Mega: 100,000+ ETH
- Filtering and sorting capabilities

## Installation and Setup

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager

### Environment Configuration

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_LAVA_RPC_URL=https://g.w.lavanet.xyz:443/gateway/hyperliquid/rpc-http/YOUR_API_KEY
```

Obtain your Lava Network API key from https://accounts.lavanet.xyz/

### Installation Steps

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3000

## Technical Implementation Details

### RPC Client Architecture

The RPC client (`lib/lavaRpc.ts`) implements:

**Connection Management:**
- Axios-based HTTP client with configurable base URL
- Dynamic endpoint switching for network changes
- Request ID increment for JSON-RPC compliance

**Core Methods:**
- `eth_blockNumber` - Latest block height
- `eth_getBlockByNumber` - Block data by number
- `eth_getBlockByHash` - Block data by hash
- `eth_getTransactionByHash` - Transaction data
- `eth_getTransactionReceipt` - Transaction receipt with status
- `eth_getBalance` - Account balance
- `eth_getTransactionCount` - Transaction count (nonce)
- `eth_gasPrice` - Current gas price
- `eth_chainId` - Network chain ID

**Error Handling:**
- Automatic retry logic via React Query
- Null response handling for non-existent data
- Network error detection and user feedback

### State Management

**Theme Context:**
- React Context API for global theme state
- localStorage integration for persistence
- SSR-safe implementation with mounted state check

**Network Context:**
- Global network selection (Mainnet/Testnet)
- RPC URL management and dynamic updates
- Window object injection for runtime configuration

**Query Configuration:**
- 5-second refresh for block data
- 10-second refresh for transaction feeds
- 30-second refresh for analytics
- Disabled retry on 404 responses

### Search Implementation

**Pattern Detection Algorithm:**
```typescript
function detectSearchType(query: string): 'block' | 'tx' | 'address' | 'unknown' {
  query = query.trim().toLowerCase();
  
  // Block number: pure digits
  if (/^\d+$/.test(query)) return 'block';
  
  // Hex validation
  if (query.startsWith('0x')) {
    const hexPart = query.slice(2);
    if (!/^[0-9a-f]+$/i.test(hexPart)) return 'unknown';
    
    // Transaction/Block hash: 66 chars
    if (query.length === 66) return 'tx';
    
    // Address: 42 chars
    if (query.length === 42) return 'address';
  }
  
  return 'unknown';
}
```

**Hash Disambiguation API:**
API route at `/api/search-hash` handles ambiguous 66-character hashes:
1. Attempts transaction lookup
2. Falls back to block lookup
3. Returns type and appropriate navigation target

### UI Components

**BlockCard:**
- Displays block summary information
- Click-through navigation to block details
- Hover effects and animations

**TransactionCard:**
- Transaction summary with truncated hashes
- Copy-to-clipboard functionality for full hashes
- Status indicators (success/failed/pending)

**Header:**
- Responsive navigation bar
- Integrated search functionality
- Network and theme controls
- Lava Network branding

### Performance Optimizations

- React Query caching reduces redundant API calls
- Lazy loading of component code
- Optimized bundle size via Next.js automatic code splitting
- Image optimization via Next.js Image component
- CSS purging in production builds

### Data Authenticity

All displayed data is fetched directly from the Hyperliquid blockchain via Lava Network RPC endpoints. The data is cryptographically verifiable:

- Block hashes are SHA3-256 hashes of block headers
- Transaction hashes are Keccak-256 hashes of signed transaction data
- Miner address of 0x0000...0000 indicates Proof of Stake consensus (no traditional mining)
- All timestamps are Unix epoch values from block headers

## Project Structure

```
hyperliquid-explorer/
├── app/
│   ├── page.tsx                    # Homepage (latest blocks & transactions)
│   ├── layout.tsx                  # Root layout with providers
│   ├── providers.tsx               # React Query provider setup
│   ├── globals.css                 # Global styles and theme variables
│   ├── block/[blockNumber]/        # Dynamic block detail route
│   ├── tx/[hash]/                  # Dynamic transaction detail route
│   ├── address/[address]/          # Dynamic address detail route
│   ├── analytics/                  # Analytics dashboard
│   ├── whales/                     # Whale tracker page
│   └── api/
│       └── search-hash/            # Hash disambiguation API
├── components/
│   ├── Header.tsx                  # Navigation header
│   ├── Footer.tsx                  # Footer component
│   ├── BlockCard.tsx               # Block display card
│   ├── TransactionCard.tsx         # Transaction display card
│   └── CopyButton.tsx              # Clipboard copy utility
├── lib/
│   ├── lavaRpc.ts                  # RPC client implementation
│   ├── themeContext.tsx            # Theme management context
│   ├── networkContext.tsx          # Network switching context
│   └── utils.ts                    # Utility functions
└── public/
    └── favicon.svg                 # Application icon
```

## API Endpoints Used

The application interfaces with standard Ethereum JSON-RPC methods via Lava Network:

**Block Methods:**
- `eth_blockNumber` - Current block height
- `eth_getBlockByNumber(blockNumber, fullTx)` - Block details
- `eth_getBlockByHash(blockHash, fullTx)` - Block by hash

**Transaction Methods:**
- `eth_getTransactionByHash(txHash)` - Transaction details
- `eth_getTransactionReceipt(txHash)` - Transaction receipt

**Account Methods:**
- `eth_getBalance(address, blockTag)` - Account balance
- `eth_getTransactionCount(address, blockTag)` - Nonce/tx count

**Network Methods:**
- `eth_gasPrice()` - Current gas price
- `eth_chainId()` - Network identifier

## Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variable: `NEXT_PUBLIC_LAVA_RPC_URL`
3. Deploy with default Next.js settings

The application is optimized for Vercel's edge network with:
- Automatic SSL/TLS
- Global CDN distribution
- Serverless function API routes
- Zero-configuration deployment

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance Metrics

- Lighthouse Score: 95+ (Performance)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: ~200KB (gzipped)

## Security Considerations

- No private keys or sensitive data stored client-side
- Environment variables used for API endpoints
- HTTPS-only communication with RPC endpoints
- Input validation on all search queries
- XSS protection via React's built-in escaping

## Known Limitations

- Historical data limited to recent blocks (performance optimization)
- Address transaction history pagination not implemented
- No WebSocket support (using HTTP polling)
- Price conversions use estimated values

## Future Enhancements

- WebSocket integration for instant updates
- Advanced filtering and sorting options
- Contract verification interface
- Export functionality for transaction data
- GraphQL API integration
- Multi-language support

## License

MIT License

## Contact

Built for HyperEVM Hackathon 2025
Powered by Lava Network RPC Infrastructure

Repository: https://github.com/Adwaitbytes/hypersight-explorer
