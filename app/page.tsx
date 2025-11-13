'use client';

import { useEffect, useState } from 'react';
import { sectors } from '@/lib/stocks';
import { 
  RSIData, 
  getRSIColor, 
  getRSITextColor,
  getOpportunityScoreColor,
  getMomentumEmoji
} from '@/lib/rsi';
import { StockDetailModal } from './components/StockDetailModal';

interface APIResponse {
  data: Record<string, RSIData>;
  cached: boolean;
  timestamp: string;
  period: number;
}

export default function Home() {
  const [rsiData, setRsiData] = useState<Record<string, RSIData>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const fetchData = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const url = `/api/rsi?period=${rsiPeriod}${forceRefresh ? '&force=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener datos');
      }
      const result: APIResponse = await response.json();
      setRsiData(result.data);
      setLastUpdate(new Date(result.timestamp).toLocaleTimeString('es-AR'));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Actualizar cada 10 minutos
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [rsiPeriod]); // Re-fetch cuando cambie el período

  const calculateSectorChange = (sectorStocks: typeof sectors[0]['stocks']) => {
    const validChanges = sectorStocks
      .map((stock) => rsiData[stock.symbol]?.changePercent)
      .filter((change): change is number => change !== null && change !== undefined);
    
    if (validChanges.length === 0) return null;
    
    const avgChange = validChanges.reduce((a, b) => a + b, 0) / validChanges.length;
    return Math.round(avgChange * 100) / 100;
  };

  // Obtener oportunidades de compra y venta
  const getOpportunities = () => {
    const allStocks = sectors.flatMap((sector) => 
      sector.stocks.map(stock => ({
        ...stock,
        sectorName: sector.name,
        rsiData: rsiData[stock.symbol]
      }))
    );

    // Oportunidades de compra: ordenar por score de oportunidad (mayor a menor)
    const buyOpportunities = allStocks
      .filter(stock => {
        const data = stock.rsiData;
        return data?.rsi !== null && data?.rsi !== undefined && 
               (data.rsi < 40 || (data.opportunityScore && data.opportunityScore >= 30));
      })
      .sort((a, b) => {
        const scoreA = a.rsiData?.opportunityScore || 0;
        const scoreB = b.rsiData?.opportunityScore || 0;
        return scoreB - scoreA; // Mayor score primero
      })
      .slice(0, 15);

    // Oportunidades de venta: RSI alto
    const sellOpportunities = allStocks
      .filter(stock => stock.rsiData?.rsi !== null && stock.rsiData?.rsi !== undefined && stock.rsiData.rsi > 70)
      .sort((a, b) => (b.rsiData?.rsi || 0) - (a.rsiData?.rsi || 0))
      .slice(0, 15);

    return { buyOpportunities, sellOpportunities };
  };

  const { buyOpportunities, sellOpportunities } = getOpportunities();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      {/* Modal de Detalles */}
      {selectedStock && (
        <StockDetailModal
          symbol={selectedStock.symbol}
          stockName={selectedStock.name}
          onClose={() => setSelectedStock(null)}
          rsiPeriod={rsiPeriod}
        />
      )}
      
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">RSI Dashboard - Mercados Argentina y EEUU</h1>
            <p className="text-xs text-gray-400 mt-1">💡 Haz clic en cualquier acción para ver su evolución histórica</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Selector de período */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Período RSI:</label>
              <select
                value={rsiPeriod}
                onChange={(e) => setRsiPeriod(Number(e.target.value))}
                disabled={loading}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm hover:border-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={7}>7 días</option>
                <option value={14}>14 días (estándar)</option>
                <option value={21}>21 días</option>
                <option value={30}>30 días</option>
              </select>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">
                Última actualización: {lastUpdate || 'Cargando...'}
              </div>
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Oportunidades */}
        {!loading && Object.keys(rsiData).length > 0 && (buyOpportunities.length > 0 || sellOpportunities.length > 0) && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Oportunidades de COMPRA */}
            <div className="bg-gradient-to-br from-green-900/30 to-gray-900 border-2 border-green-600/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">📈</div>
                <div>
                  <h2 className="text-xl font-bold text-green-400">Oportunidades de COMPRA</h2>
                  <p className="text-xs text-gray-400">Ordenadas por Score de Oportunidad</p>
                </div>
              </div>
              
              {buyOpportunities.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {buyOpportunities.map((stock) => {
                    const data = stock.rsiData;
                    const scoreColor = getOpportunityScoreColor(data?.opportunityScore || null);
                    const momentumEmoji = getMomentumEmoji(data?.rsiMomentum);
                    
                    return (
                      <div
                        key={stock.symbol}
                        className="bg-gray-800/50 rounded p-3 border border-green-700/30 hover:border-green-600/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedStock({ symbol: stock.symbol, name: stock.name })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedStock({ symbol: stock.symbol, name: stock.name });
                          }
                        }}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{stock.symbol}</span>
                              <span className="text-lg" title={`Momentum: ${data?.rsiMomentum}`}>
                                {momentumEmoji}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 truncate">{stock.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{stock.sectorName}</div>
                            
                            {/* Indicadores en línea horizontal */}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">RSI:</span>
                                <span className="text-sm font-semibold text-green-400">
                                  {data?.rsi?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              
                              {data?.stochRsi !== null && data?.stochRsi !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">Stoch:</span>
                                  <span className="text-sm font-semibold text-blue-400">
                                    {data.stochRsi.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              
                              {data?.rsiSmoothed !== null && data?.rsiSmoothed !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">Suav:</span>
                                  <span className="text-sm font-semibold text-purple-400">
                                    {data.rsiSmoothed.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Cambio de precio */}
                            {data?.changePercent !== null && data?.changePercent !== undefined && (
                              <div className={`text-xs mt-1 font-medium ${data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Precio: {data.changePercent >= 0 ? '▲' : '▼'} {Math.abs(data.changePercent).toFixed(2)}%
                              </div>
                            )}
                          </div>
                          
                          {/* Score de Oportunidad - destacado */}
                          {data?.opportunityScore !== null && data?.opportunityScore !== undefined && (
                            <div className="text-center flex-shrink-0">
                              <div className="text-xs text-gray-400 mb-1">Score</div>
                              <div className={`${scoreColor} px-3 py-1.5 rounded-lg font-bold text-lg shadow-lg min-w-[60px]`}>
                                {data.opportunityScore}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No hay oportunidades de compra en este momento
                </div>
              )}
            </div>

            {/* Oportunidades de VENTA */}
            <div className="bg-gradient-to-br from-red-900/30 to-gray-900 border-2 border-red-600/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">📉</div>
                <div>
                  <h2 className="text-xl font-bold text-red-400">Oportunidades de VENTA</h2>
                  <p className="text-xs text-gray-400">RSI {'>'} 70 (Sobrecompradas)</p>
                </div>
              </div>
              
              {sellOpportunities.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {sellOpportunities.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="bg-gray-800/50 rounded p-3 border border-red-700/30 hover:border-red-600/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedStock({ symbol: stock.symbol, name: stock.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedStock({ symbol: stock.symbol, name: stock.name });
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <div className="font-bold text-white">{stock.symbol}</div>
                          <div className="text-xs text-gray-400">{stock.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{stock.sectorName}</div>
                        </div>
                        <div className="text-right">
                          <div className="bg-red-600 px-3 py-1 rounded font-bold text-sm">
                            RSI: {stock.rsiData?.rsi?.toFixed(2)}
                          </div>
                          {stock.rsiData?.changePercent !== null && stock.rsiData?.changePercent !== undefined && (
                            <div className={`text-xs mt-1 ${stock.rsiData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {stock.rsiData.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.rsiData.changePercent).toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No hay oportunidades de venta en este momento
                </div>
              )}
            </div>
          </div>
        )}

        {loading && Object.keys(rsiData).length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Cargando datos RSI...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sectors.map((sector) => {
              const sectorChange = calculateSectorChange(sector.stocks);
              const changeColor = sectorChange !== null && sectorChange >= 0 ? 'text-green-400' : 'text-red-400';
              
              return (
                <div
                  key={sector.name}
                  className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                >
                  {/* Sector Header */}
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">{sector.name}</h2>
                      {sectorChange !== null && (
                        <span className={`text-sm font-semibold ${changeColor}`}>
                          {sectorChange >= 0 ? '▲' : '▼'} {Math.abs(sectorChange)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stocks List */}
                  <div className="divide-y divide-gray-800">
                    {sector.stocks.map((stock) => {
                      const data = rsiData[stock.symbol];
                      const rsi = data?.rsi;
                      const changePercent = data?.changePercent;
                      const rsiColor = getRSIColor(rsi);
                      const opportunityScore = data?.opportunityScore;
                      const momentum = data?.rsiMomentum;
                      const momentumEmoji = getMomentumEmoji(momentum);
                      const stochRsi = data?.stochRsi;
                      const rsiSmoothed = data?.rsiSmoothed;

                      return (
                        <div
                          key={stock.symbol}
                          className="px-4 py-3 hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedStock({ symbol: stock.symbol, name: stock.name })}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedStock({ symbol: stock.symbol, name: stock.name });
                            }
                          }}
                        >
                          {/* Línea 1: Símbolo y Score */}
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{stock.symbol}</span>
                              {opportunityScore !== null && opportunityScore !== undefined && opportunityScore >= 40 && (
                                <span 
                                  className="px-2 py-0.5 bg-green-600/80 text-white text-xs rounded font-bold"
                                  title={`Score de Oportunidad: ${opportunityScore}`}
                                >
                                  {opportunityScore}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* RSI Badge */}
                              {rsi !== null && rsi !== undefined ? (
                                <div className={`${rsiColor} px-2 py-1 rounded text-xs font-bold min-w-[45px] text-center`}>
                                  {rsi.toFixed(1)}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">N/A</div>
                              )}
                            </div>
                          </div>

                          {/* Línea 2: Nombre de la empresa (truncado) */}
                          <div className="text-xs text-gray-400 truncate mb-1.5">
                            {stock.name}
                          </div>

                          {/* Línea 3: Indicadores + Momentum + Cambio */}
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-3">
                              {/* Momentum */}
                              <div className="flex items-center gap-1" title={`Momentum: ${momentum}`}>
                                <span>{momentumEmoji}</span>
                                <span className="text-gray-500 capitalize">{momentum}</span>
                              </div>
                              
                              {/* StochRSI */}
                              {stochRsi !== null && stochRsi !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">S:</span>
                                  <span className="text-blue-400 font-medium">{stochRsi.toFixed(0)}</span>
                                </div>
                              )}
                              
                              {/* RSI Suavizado */}
                              {rsiSmoothed !== null && rsiSmoothed !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Suav:</span>
                                  <span className="text-purple-400 font-medium">{rsiSmoothed.toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Cambio de Precio */}
                            {changePercent !== null && changePercent !== undefined && (
                              <div className={`font-semibold ${changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h3 className="text-sm font-semibold mb-4">Leyenda de Indicadores:</h3>
          
          {/* 3 Columnas Balanceadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-4">
            {/* Columna 1: RSI Tradicional */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-3">RSI Tradicional:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-red-600 rounded flex-shrink-0"></div>
                  <span className="text-xs">≥ 70 Sobrecomprado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-yellow-500 rounded flex-shrink-0"></div>
                  <span className="text-xs">50-70 Neutral Alto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-green-600 rounded flex-shrink-0"></div>
                  <span className="text-xs">30-50 Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-green-700 rounded flex-shrink-0"></div>
                  <span className="text-xs">&lt; 30 Sobrevendido</span>
                </div>
              </div>
            </div>

            {/* Columna 2: Momentum RSI */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-3">Momentum RSI:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">📈</span>
                  <span className="text-xs">Subiendo (positiva)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">➡️</span>
                  <span className="text-xs">Neutral (sin cambio)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">📉</span>
                  <span className="text-xs">Bajando (negativa)</span>
                </div>
              </div>
            </div>
            
            {/* Columna 3: Score de Oportunidad */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-3">Score de Oportunidad:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-gradient-to-r from-green-600 to-green-500 rounded flex-shrink-0"></div>
                  <span className="text-xs">≥ 80 Excelente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-green-600 rounded flex-shrink-0"></div>
                  <span className="text-xs">60-79 Buena</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-yellow-600 rounded flex-shrink-0"></div>
                  <span className="text-xs">40-59 Moderada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explicaciones */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded text-xs text-gray-400 border-t border-gray-700">
            <p><strong className="text-white">StochRSI:</strong> Indicador más sensible que el RSI tradicional. Valores {'<'} 20 indican sobreventa fuerte.</p>
            <p className="mt-1"><strong className="text-white">RSI Suavizado:</strong> Media móvil exponencial del RSI para reducir ruido y confirmar tendencias.</p>
            <p className="mt-1"><strong className="text-white">Score de Oportunidad:</strong> Combina RSI, StochRSI, Momentum y cambio de precio para dar una señal integral.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

