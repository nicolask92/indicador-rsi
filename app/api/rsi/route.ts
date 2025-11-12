import { NextResponse } from 'next/server';
import axios from 'axios';
import { sectors } from '@/lib/stocks';
import { calculateRSI, RSIData } from '@/lib/rsi';
import cache from '@/lib/cache';

interface CachedRSIData {
  data: Record<string, RSIData>;
  timestamp: string;
}

const getCacheKey = (period: number) => `rsi_data_${period}`;

/**
 * Obtiene datos históricos de Yahoo Finance
 */
async function fetchStockData(symbol: string, market: 'US' | 'AR', rsiPeriod: number = 14): Promise<RSIData> {
  try {
    // Ajustar símbolo para Yahoo Finance
    let yahooSymbol = symbol;
    
    // Los símbolos argentinos que terminan en .BA ya están en formato correcto
    // Los ADRs de Argentina están en formato correcto también
    
    // Obtener datos suficientes para calcular RSI (período + 15 días extra para seguridad)
    const daysToFetch = Math.max(rsiPeriod + 20, 35);
    const period1 = Math.floor(Date.now() / 1000) - daysToFetch * 24 * 60 * 60;
    const period2 = Math.floor(Date.now() / 1000);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?period1=${period1}&period2=${period2}&interval=1d`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const data = response.data;
    
    if (!data?.chart?.result?.[0]) {
      return {
        symbol,
        rsi: null,
        price: null,
        change: null,
        changePercent: null,
        error: 'No data',
      };
    }

    const result = data.chart.result[0];
    const quotes = result.indicators.quote[0];
    const closePrices = quotes.close.filter((p: number | null) => p !== null) as number[];
    
    if (closePrices.length < rsiPeriod + 1) {
      return {
        symbol,
        rsi: null,
        price: null,
        change: null,
        changePercent: null,
        error: 'Insufficient data',
      };
    }

    // Calcular RSI
    const rsi = calculateRSI(closePrices, rsiPeriod);
    
    // Obtener precio actual y cambio
    const currentPrice = closePrices[closePrices.length - 1];
    const previousPrice = closePrices[closePrices.length - 2];
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    return {
      symbol,
      rsi,
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return {
      symbol,
      rsi: null,
      price: null,
      change: null,
      changePercent: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Procesa los stocks en lotes para no sobrecargar la API
 */
async function fetchAllStocks(rsiPeriod: number = 14): Promise<Record<string, RSIData>> {
  const allStocks = sectors.flatMap((sector) => sector.stocks);
  const results: Record<string, RSIData> = {};
  
  // Procesar en lotes de 10 símbolos cada 2 segundos para evitar rate limiting
  const batchSize = 10;
  for (let i = 0; i < allStocks.length; i += batchSize) {
    const batch = allStocks.slice(i, i + batchSize);
    const batchPromises = batch.map((stock) => fetchStockData(stock.symbol, stock.market, rsiPeriod));
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach((result) => {
      results[result.symbol] = result;
    });
    
    // Pequeña pausa entre lotes (excepto en el último)
    if (i + batchSize < allStocks.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export async function GET(request: Request) {
  try {
    // Obtener el período del query string (default: 14)
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '14', 10);
    const forceRefresh = searchParams.get('force') === 'true';
    
    // Validar el período
    if (![7, 14, 21, 30].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be 7, 14, 21, or 30' },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(period);
    
    // Si no es una actualización forzada, verificar si hay datos en caché
    if (!forceRefresh) {
      const cachedData = cache.get<CachedRSIData>(cacheKey);
      if (cachedData) {
        return NextResponse.json({
          data: cachedData.data,
          cached: true,
          timestamp: cachedData.timestamp,
          period,
        });
      }
    }

    // Obtener datos frescos (o porque no hay caché, o porque es actualización forzada)
    console.log(`Fetching fresh RSI data for period ${period}${forceRefresh ? ' (forced refresh)' : ''}...`);
    const data = await fetchAllStocks(period);
    const timestamp = new Date().toISOString();
    
    // Guardar en caché con timestamp
    cache.set(cacheKey, { data, timestamp });
    
    return NextResponse.json({
      data,
      cached: false,
      timestamp,
      period,
    });
  } catch (error) {
    console.error('Error in RSI API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSI data' },
      { status: 500 }
    );
  }
}

