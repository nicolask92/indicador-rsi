'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface HistoricalDataPoint {
  date: string;
  price: number;
  rsi: number | null;
  stochRsi: number | null;
  rsiSmoothed: number | null;
}

interface StockInfo {
  symbol: string;
  name: string;
  currency: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

interface StockDetailModalProps {
  symbol: string;
  stockName: string;
  onClose: () => void;
  rsiPeriod: number;
}

export const StockDetailModal = ({ symbol, stockName, onClose, rsiPeriod }: StockDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stock-history?symbol=${symbol}&period=${rsiPeriod}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener datos históricos');
        }
        
        const data = await response.json();
        setStockInfo(data.stockInfo);
        setHistoricalData(data.historicalData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, rsiPeriod]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg border-2 border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-start z-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{symbol}</h2>
            <p className="text-sm text-gray-400">{stockName}</p>
            {stockInfo && (
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xl font-semibold text-white">
                  {stockInfo.currency} {stockInfo.currentPrice?.toFixed(2) || 'N/A'}
                </span>
                {stockInfo.changePercent !== null && stockInfo.changePercent !== undefined && (
                  <span className={`text-sm font-medium ${stockInfo.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stockInfo.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stockInfo.changePercent).toFixed(2)}%
                    {stockInfo.change !== null && stockInfo.change !== undefined && (
                      <> ({stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)})</>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-gray-800 rounded transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-400 text-lg">Cargando datos históricos...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-red-400 text-lg">Error: {error}</div>
            </div>
          )}

          {!loading && !error && historicalData.length > 0 && (
            <div className="space-y-6">
              {/* Gráfico de Precio */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">Evolución del Precio (90 días)</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => {
                          const parts = value.split('/');
                          return `${parts[0]}/${parts[1]}`;
                        }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 11 }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        name="Precio"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de RSI */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">
                  RSI (Período: {rsiPeriod} días)
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => {
                          const parts = value.split('/');
                          return `${parts[0]}/${parts[1]}`;
                        }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                      />
                      <Legend />
                      
                      {/* Líneas de referencia */}
                      <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '70', fill: '#EF4444', fontSize: 12 }} />
                      <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="3 3" label={{ value: '50', fill: '#6B7280', fontSize: 12 }} />
                      <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label={{ value: '30', fill: '#10B981', fontSize: 12 }} />
                      
                      <Line
                        type="monotone"
                        dataKey="rsi"
                        name="RSI"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                      />
                      {historicalData.some(d => d.rsiSmoothed !== null) && (
                        <Line
                          type="monotone"
                          dataKey="rsiSmoothed"
                          name="RSI Suavizado"
                          stroke="#A855F7"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de StochRSI */}
              {historicalData.some(d => d.stochRsi !== null) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">
                    StochRSI (Indicador más sensible)
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9CA3AF"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => {
                            const parts = value.split('/');
                            return `${parts[0]}/${parts[1]}`;
                          }}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          tick={{ fontSize: 11 }}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '0.5rem',
                          }}
                          labelStyle={{ color: '#F9FAFB' }}
                        />
                        <Legend />
                        
                        {/* Líneas de referencia para StochRSI */}
                        <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '80', fill: '#EF4444', fontSize: 12 }} />
                        <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="3 3" label={{ value: '50', fill: '#6B7280', fontSize: 12 }} />
                        <ReferenceLine y={20} stroke="#10B981" strokeDasharray="3 3" label={{ value: '20', fill: '#10B981', fontSize: 12 }} />
                        
                        <Line
                          type="monotone"
                          dataKey="stochRsi"
                          name="StochRSI"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold mb-2 text-gray-400">Información:</h3>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Los datos muestran la evolución de los últimos 90 días</li>
                  <li>• RSI {'>'} 70: Zona de sobrecompra (posible corrección a la baja)</li>
                  <li>• RSI {'<'} 30: Zona de sobreventa (posible reversión al alza)</li>
                  <li>• StochRSI es más sensible y puede detectar reversiones más temprano</li>
                  <li>• RSI Suavizado (línea punteada) reduce el ruido del indicador</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

