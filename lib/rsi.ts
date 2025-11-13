export interface RSIData {
  symbol: string;
  rsi: number | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  stochRsi?: number | null;
  rsiSmoothed?: number | null;
  rsiMomentum?: 'up' | 'down' | 'neutral';
  opportunityScore?: number | null;
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

/**
 * Calcula el StochRSI (Stochastic RSI)
 * Más sensible que el RSI tradicional para detectar reversiones
 * @param rsiValues Array de valores RSI históricos
 * @param period Período para el cálculo del estocástico (default: 14)
 * @returns Valor del StochRSI (0-100) o null
 */
export function calculateStochRSI(rsiValues: number[], period: number = 14): number | null {
  if (rsiValues.length < period) {
    return null;
  }

  // Tomar los últimos 'period' valores
  const recentRSI = rsiValues.slice(-period);
  
  const maxRSI = Math.max(...recentRSI);
  const minRSI = Math.min(...recentRSI);
  const currentRSI = rsiValues[rsiValues.length - 1];

  if (maxRSI === minRSI) {
    return 50; // Neutral si no hay variación
  }

  const stochRSI = ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100;
  return Math.round(stochRSI * 100) / 100;
}

/**
 * Calcula la Media Móvil Exponencial (EMA)
 * @param values Array de valores
 * @param period Período para la EMA
 * @returns Valor de la EMA o null
 */
export function calculateEMA(values: number[], period: number): number | null {
  if (values.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);
  
  // Calcular SMA inicial
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Calcular EMA para el resto de valores
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }
  
  return Math.round(ema * 100) / 100;
}

/**
 * Calcula el RSI Suavizado usando EMA
 * @param prices Array de precios históricos
 * @param rsiPeriod Período para el RSI (default: 14)
 * @param emaPeriod Período para la EMA (default: 9)
 * @returns Valor del RSI suavizado o null
 */
export function calculateSmoothedRSI(prices: number[], rsiPeriod: number = 14, emaPeriod: number = 9): number | null {
  if (prices.length < rsiPeriod + emaPeriod) {
    return null;
  }

  // Calcular RSI para cada punto
  const rsiValues: number[] = [];
  for (let i = rsiPeriod; i < prices.length; i++) {
    const priceSlice = prices.slice(0, i + 1);
    const rsi = calculateRSI(priceSlice, rsiPeriod);
    if (rsi !== null) {
      rsiValues.push(rsi);
    }
  }

  if (rsiValues.length < emaPeriod) {
    return null;
  }

  return calculateEMA(rsiValues, emaPeriod);
}

/**
 * Determina el momentum del RSI (dirección)
 * @param prices Array de precios históricos
 * @param rsiPeriod Período para el RSI
 * @returns 'up', 'down' o 'neutral'
 */
export function calculateRSIMomentum(prices: number[], rsiPeriod: number = 14): 'up' | 'down' | 'neutral' {
  if (prices.length < rsiPeriod + 3) {
    return 'neutral';
  }

  // Calcular RSI para los últimos 3 puntos
  const rsiValues: number[] = [];
  for (let i = prices.length - 3; i <= prices.length; i++) {
    const priceSlice = prices.slice(0, i);
    const rsi = calculateRSI(priceSlice, rsiPeriod);
    if (rsi !== null) {
      rsiValues.push(rsi);
    }
  }

  if (rsiValues.length < 3) {
    return 'neutral';
  }

  // Calcular tendencia promedio
  const trend1 = rsiValues[1] - rsiValues[0];
  const trend2 = rsiValues[2] - rsiValues[1];
  const avgTrend = (trend1 + trend2) / 2;

  if (avgTrend > 1.5) return 'up';
  if (avgTrend < -1.5) return 'down';
  return 'neutral';
}

/**
 * Calcula un score de oportunidad (0-100)
 * Combina múltiples factores para determinar la fuerza de la señal
 * @param rsi Valor RSI actual
 * @param stochRsi Valor StochRSI
 * @param momentum Momentum del RSI
 * @param changePercent Cambio porcentual del precio
 * @returns Score de 0-100 donde mayor es mejor oportunidad de compra
 */
export function calculateOpportunityScore(
  rsi: number | null,
  stochRsi: number | null,
  momentum: 'up' | 'down' | 'neutral',
  changePercent: number | null
): number | null {
  if (rsi === null) return null;

  let score = 0;

  // Factor 1: RSI bajo es bueno para compra (40 puntos máximo)
  if (rsi <= 20) {
    score += 40;
  } else if (rsi <= 30) {
    score += 35;
  } else if (rsi <= 40) {
    score += 25;
  } else if (rsi <= 50) {
    score += 10;
  }

  // Factor 2: StochRSI bajo indica sobreventa (25 puntos máximo)
  if (stochRsi !== null) {
    if (stochRsi <= 20) {
      score += 25;
    } else if (stochRsi <= 30) {
      score += 20;
    } else if (stochRsi <= 40) {
      score += 10;
    }
  }

  // Factor 3: Momentum positivo es buena señal (20 puntos)
  if (momentum === 'up') {
    score += 20;
  } else if (momentum === 'neutral') {
    score += 5;
  }

  // Factor 4: Precio cayendo pero con indicadores de reversión (15 puntos)
  if (changePercent !== null) {
    if (changePercent < -3 && rsi < 35) {
      score += 15; // Gran caída con RSI bajo = oportunidad
    } else if (changePercent < -1.5 && rsi < 40) {
      score += 10;
    } else if (changePercent > 2 && momentum === 'up' && rsi < 50) {
      score += 8; // Subiendo con momentum positivo
    }
  }

  return Math.min(100, Math.round(score));
}

/**
 * Obtiene el color del badge según el score de oportunidad
 */
export function getOpportunityScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-600';
  if (score >= 80) return 'bg-gradient-to-r from-green-600 to-green-500';
  if (score >= 60) return 'bg-green-600';
  if (score >= 40) return 'bg-yellow-600';
  if (score >= 20) return 'bg-orange-600';
  return 'bg-gray-600';
}

/**
 * Obtiene el emoji según el momentum
 */
export function getMomentumEmoji(momentum: 'up' | 'down' | 'neutral' | undefined): string {
  if (momentum === 'up') return '📈';
  if (momentum === 'down') return '📉';
  return '➡️';
}

