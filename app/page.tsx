'use client';

import { useEffect, useState } from 'react';
import { sectors } from '@/lib/stocks';
import { RSIData, getRSIColor, getRSITextColor } from '@/lib/rsi';

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

    const buyOpportunities = allStocks
      .filter(stock => stock.rsiData?.rsi !== null && stock.rsiData?.rsi !== undefined && stock.rsiData.rsi < 30)
      .sort((a, b) => (a.rsiData?.rsi || 0) - (b.rsiData?.rsi || 0))
      .slice(0, 10);

    const sellOpportunities = allStocks
      .filter(stock => stock.rsiData?.rsi !== null && stock.rsiData?.rsi !== undefined && stock.rsiData.rsi > 70)
      .sort((a, b) => (b.rsiData?.rsi || 0) - (a.rsiData?.rsi || 0))
      .slice(0, 10);

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
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold">RSI Dashboard - Mercados Argentina y EEUU</h1>
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
                  <p className="text-xs text-gray-400">RSI {'<'} 30 (Sobrevendidas)</p>
                </div>
              </div>
              
              {buyOpportunities.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {buyOpportunities.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="bg-gray-800/50 rounded p-3 border border-green-700/30 hover:border-green-600/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <div className="font-bold text-white">{stock.symbol}</div>
                          <div className="text-xs text-gray-400">{stock.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{stock.sectorName}</div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-700 px-3 py-1 rounded font-bold text-sm">
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
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {sellOpportunities.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="bg-gray-800/50 rounded p-3 border border-red-700/30 hover:border-red-600/50 transition-colors"
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
                      const rsiTextColor = getRSITextColor(rsi);

                      return (
                        <div
                          key={stock.symbol}
                          className="px-4 py-2 hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{stock.symbol}</div>
                              <div className="text-xs text-gray-400 truncate">
                                {stock.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-2">
                              {/* RSI Badge */}
                              <div className="text-right">
                                <div className="text-xs text-gray-400">RSI</div>
                                {rsi !== null && rsi !== undefined ? (
                                  <div className={`${rsiColor} px-2 py-1 rounded text-xs font-bold`}>
                                    {rsi.toFixed(2)}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500">N/A</div>
                                )}
                              </div>
                              
                              {/* Change Percentage */}
                              {changePercent !== null && changePercent !== undefined && (
                                <div className="text-right min-w-[60px]">
                                  <div className="text-xs text-gray-400">%</div>
                                  <div
                                    className={`text-xs font-semibold ${
                                      changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}
                                  >
                                    {changePercent >= 0 ? '▲' : '▼'}{' '}
                                    {Math.abs(changePercent).toFixed(2)}%
                                  </div>
                                </div>
                              )}
                            </div>
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
          <h3 className="text-sm font-semibold mb-3">Leyenda RSI:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-red-600 rounded"></div>
              <span>≥ 70 (Sobrecomprado)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-yellow-500 rounded"></div>
              <span>50-70 (Neutral Alto)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-green-600 rounded"></div>
              <span>30-50 (Neutral)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-green-700 rounded"></div>
              <span>&lt; 30 (Sobrevendido)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

