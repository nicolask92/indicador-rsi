export interface RSIData {
  symbol: string;
  rsi: number | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  error?: string;
}

/**
 * Calcula el RSI (Relative Strength Index)
 * @param prices Array de precios históricos
 * @param period Período para el cálculo (default: 14)
 * @returns Valor del RSI o null si no hay suficientes datos
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) {
    return null;
  }

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  // Primera iteración: promedio simple
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) {
      gains += changes[i];
    } else {
      losses += Math.abs(changes[i]);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Iteraciones subsiguientes: promedio suavizado (Wilder's smoothing)
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100;
}

/**
 * Obtiene el color según el nivel de RSI
 */
export function getRSIColor(rsi: number | null): string {
  if (rsi === null) return 'bg-gray-600';
  if (rsi >= 70) return 'bg-red-600';
  if (rsi >= 50) return 'bg-yellow-500';
  if (rsi >= 30) return 'bg-green-600';
  return 'bg-green-700';
}

/**
 * Obtiene el texto del color según el nivel de RSI
 */
export function getRSITextColor(rsi: number | null): string {
  if (rsi === null) return 'text-gray-300';
  if (rsi >= 70) return 'text-red-400';
  if (rsi >= 50) return 'text-yellow-400';
  if (rsi >= 30) return 'text-green-400';
  return 'text-green-500';
}

