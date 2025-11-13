import { NextResponse } from 'next/server';
import axios from 'axios';
import { calculateRSI, calculateStochRSI, calculateSmoothedRSI } from '@/lib/rsi';

interface HistoricalDataPoint {
  date: string;
  price: number;
  rsi: number | null;
  stochRsi: number | null;
  rsiSmoothed: number | null;
}

/**
 * Obtiene datos históricos detallados de una acción específica
 * Incluye precio, RSI, StochRSI y RSI Suavizado para los últimos 90 días
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const period = parseInt(searchParams.get('period') || '14', 10);
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Obtener 120 días para tener suficientes datos para calcular indicadores
    const daysToFetch = 120;
    const period1 = Math.floor(Date.now() / 1000) - daysToFetch * 24 * 60 * 60;
    const period2 = Math.floor(Date.now() / 1000);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const data = response.data;
    
    if (!data?.chart?.result?.[0]) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      );
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const closePrices = quotes.close;
    
    // Filtrar precios nulos
    const validData: { timestamp: number; price: number; index: number }[] = [];
    closePrices.forEach((price: number | null, index: number) => {
      if (price !== null) {
        validData.push({ timestamp: timestamps[index], price, index });
      }
    });

    if (validData.length < period + 20) {
      return NextResponse.json(
        { error: 'Insufficient data' },
        { status: 400 }
      );
    }

    // Extraer solo los precios para cálculos
    const prices = validData.map(d => d.price);
    
    // Calcular indicadores para cada punto
    const historicalData: HistoricalDataPoint[] = [];
    
    for (let i = period; i < validData.length; i++) {
      const priceSlice = prices.slice(0, i + 1);
      
      // Calcular RSI
      const rsi = calculateRSI(priceSlice, period);
      
      // Calcular RSI histórico para StochRSI
      const rsiValues: number[] = [];
      for (let j = period; j <= i; j++) {
        const tempSlice = prices.slice(0, j + 1);
        const tempRsi = calculateRSI(tempSlice, period);
        if (tempRsi !== null) {
          rsiValues.push(tempRsi);
        }
      }
      
      const stochRsi = rsiValues.length >= 14 ? calculateStochRSI(rsiValues, 14) : null;
      const rsiSmoothed = calculateSmoothedRSI(priceSlice, period, 9);
      
      const date = new Date(validData[i].timestamp * 1000).toLocaleDateString('es-AR');
      
      historicalData.push({
        date,
        price: Math.round(validData[i].price * 100) / 100,
        rsi,
        stochRsi,
        rsiSmoothed,
      });
    }
    
    // Tomar solo los últimos 90 días para el gráfico
    const displayData = historicalData.slice(-90);
    
    // Información de la acción
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || meta.chartPreviousClose || validData[validData.length - 1]?.price || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || validData[validData.length - 2]?.price || 0;
    const change = previousClose !== 0 ? currentPrice - previousClose : 0;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
    
    const stockInfo = {
      symbol: meta.symbol || symbol,
      name: symbol,
      currency: meta.currency || 'USD',
      currentPrice: currentPrice,
      previousClose: previousClose,
      change: change,
      changePercent: changePercent,
    };

    return NextResponse.json({
      stockInfo,
      historicalData: displayData,
      period,
    });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}

