import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getLatestBlockNumber, getGasPrice, getChainId } from '@/lib/lavaRpc';
import { getHyperliquidTokenPrice, getLavaNetworkTokenPrice, getSocialMediaData } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get live blockchain data
    let liveData = '';
    try {
      const latestBlock = await getLatestBlockNumber();
      const gasPrice = await getGasPrice();
      const chainId = await getChainId();
      
      liveData = `
        Current Blockchain Data:
        - Latest Block Number: ${latestBlock}
        - Current Gas Price: ${gasPrice} wei
        - Chain ID: ${chainId}
      `;
    } catch (error) {
      console.error('Error fetching live data:', error);
      liveData = 'Unable to fetch current blockchain data.';
    }

    // Get live market data
    let marketData = '';
    try {
      const hyperliquidData = await getHyperliquidTokenPrice();
      const lavaData = await getLavaNetworkTokenPrice();
      
      if (hyperliquidData) {
        marketData += `
          Hyperliquid (HYPE) Token Data:
          - Price: $${hyperliquidData.usd.toFixed(2)} USD
          - 24h Change: ${hyperliquidData.usd_24h_change.toFixed(2)}%
          - Market Cap: $${(hyperliquidData.market_cap / 1000000).toFixed(2)}M
          - 24h Volume: $${(hyperliquidData.volume_24h / 1000000).toFixed(2)}M
        `;
      }
      
      if (lavaData) {
        marketData += `
          Lava Network (LAVA) Token Data:
          - Price: $${lavaData.usd.toFixed(4)} USD
          - 24h Change: ${lavaData.usd_24h_change.toFixed(2)}%
          - Market Cap: $${(lavaData.market_cap / 1000000).toFixed(2)}M
          - 24h Volume: $${(lavaData.volume_24h / 1000000).toFixed(2)}M
        `;
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      marketData = 'Unable to fetch current market data.';
    }

    // Get social media data
    let socialData = '';
    try {
      const socialMediaData = await getSocialMediaData();
      if (socialMediaData) {
        socialData = `
          Social Media Links:
          
          Hyperliquid:
          - Website: ${socialMediaData.hyperliquid.website}
          - Twitter: ${socialMediaData.hyperliquid.twitter}
          - Discord: ${socialMediaData.hyperliquid.discord}
          - Telegram: ${socialMediaData.hyperliquid.telegram}
          - Blog: ${socialMediaData.hyperliquid.blog}
          
          Lava Network:
          - Website: ${socialMediaData.lavanet.website}
          - Twitter: ${socialMediaData.lavanet.twitter}
          - Discord: ${socialMediaData.lavanet.discord}
          - Telegram: ${socialMediaData.lavanet.telegram}
          - Blog: ${socialMediaData.lavanet.blog}
        `;
      }
    } catch (error) {
      console.error('Error fetching social media data:', error);
      socialData = 'Unable to fetch social media data.';
    }

    // OpenAI API configuration
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Enhanced system context for the blockchain explorer with live data
    const systemContext = `
      You are an AI assistant for Hyperliquid Explorer, a blockchain explorer for the Hyperliquid network powered by Lava Network's high-performance RPC infrastructure.

      About Hyperliquid:
      Hyperliquid is a high-performance decentralized exchange (DEX) built on the Hyperliquid network. It offers zero-fees, low-latency trading with a focus on professional traders and market makers. The platform features perpetual futures trading, spot trading, and a native order book. Key features include:
      - Zero gas fees for trading
      - Sub-second trade execution
      - Deep liquidity and low slippage
      - Professional-grade trading tools
      - Native token: HYPE

      About Lava Network:
      Lava Network is a modular data access layer that provides high-performance RPC infrastructure. It powers the Hyperliquid Explorer by aggregating data providers and routing RPC traffic based on speed and reliability. Key features include:
      - Multi-chain RPC infrastructure
      - High availability and reliability
      - Performance-based routing
      - Decentralized data access
      - Native token: LAVA

      ${liveData}

      ${marketData}

      ${socialData}

      Use the live blockchain, market, and social media data when relevant to answer questions.
      Keep responses concise, helpful, and accurate.
      Focus on blockchain topics related to Hyperliquid, Lava Network, DeFi, and crypto trading.
      If asked about general topics outside blockchain, politely redirect to blockchain-related queries.
    `;

    // Make the OpenAI API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the response from OpenAI
    const aiResponse = completion.choices[0].message.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('Chatbot API Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}