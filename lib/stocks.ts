export interface Stock {
  symbol: string;
  name: string;
  market: 'US' | 'AR';
}

export interface Sector {
  name: string;
  stocks: Stock[];
}

export const sectors: Sector[] = [
  {
    name: "ETF's",
    stocks: [
      { symbol: 'SPY', name: 'S&P 500 ETF', market: 'US' },
      { symbol: 'QQQ', name: 'Nasdaq 100 ETF', market: 'US' },
      { symbol: 'DIA', name: 'Dow Jones ETF', market: 'US' },
      { symbol: 'IWM', name: 'Russell 2000 ETF', market: 'US' },
      { symbol: 'ARKK', name: 'ARK Innovation', market: 'US' },
      { symbol: 'GDX', name: 'Gold Miners ETF', market: 'US' },
      { symbol: 'ITA', name: 'Aerospace & Defense', market: 'US' },
      { symbol: 'IEUR', name: 'iShares Europe', market: 'US' },
      { symbol: 'EEM', name: 'Emerging Markets', market: 'US' },
      { symbol: 'EWJ', name: 'Japan ETF', market: 'US' },
      { symbol: 'EWZ', name: 'Brazil ETF', market: 'US' },
      { symbol: 'FXI', name: 'China Large-Cap', market: 'US' },
      { symbol: 'GLD', name: 'Gold ETF', market: 'US' },
      { symbol: 'SLV', name: 'Silver ETF', market: 'US' },
      { symbol: 'IBIT', name: 'Bitcoin ETF', market: 'US' },
      { symbol: 'ETHA', name: 'Ethereum ETF', market: 'US' },
    ],
  },
  {
    name: 'Technology',
    stocks: [
      { symbol: 'AAPL', name: 'Apple', market: 'US' },
      { symbol: 'MSFT', name: 'Microsoft', market: 'US' },
      { symbol: 'GOOGL', name: 'Alphabet', market: 'US' },
      { symbol: 'META', name: 'Meta Platforms', market: 'US' },
      { symbol: 'NVDA', name: 'NVIDIA', market: 'US' },
      { symbol: 'TSLA', name: 'Tesla', market: 'US' },
      { symbol: 'AMD', name: 'AMD', market: 'US' },
      { symbol: 'INTC', name: 'Intel', market: 'US' },
      { symbol: 'CRM', name: 'Salesforce', market: 'US' },
      { symbol: 'ORCL', name: 'Oracle', market: 'US' },
      { symbol: 'ADBE', name: 'Adobe', market: 'US' },
      { symbol: 'AVGO', name: 'Broadcom', market: 'US' },
      { symbol: 'CSCO', name: 'Cisco', market: 'US' },
      { symbol: 'QCOM', name: 'Qualcomm', market: 'US' },
      { symbol: 'TXN', name: 'Texas Instruments', market: 'US' },
      { symbol: 'SNOW', name: 'Snowflake', market: 'US' },
      { symbol: 'PLTR', name: 'Palantir', market: 'US' },
    ],
  },
  {
    name: 'Energy',
    stocks: [
      { symbol: 'XOM', name: 'Exxon Mobil', market: 'US' },
      { symbol: 'CVX', name: 'Chevron', market: 'US' },
      { symbol: 'COP', name: 'ConocoPhillips', market: 'US' },
      { symbol: 'SLB', name: 'Schlumberger', market: 'US' },
      { symbol: 'EOG', name: 'EOG Resources', market: 'US' },
      { symbol: 'MPC', name: 'Marathon Petroleum', market: 'US' },
      { symbol: 'PSX', name: 'Phillips 66', market: 'US' },
      { symbol: 'VLO', name: 'Valero Energy', market: 'US' },
    ],
  },
  {
    name: 'Financial',
    stocks: [
      { symbol: 'JPM', name: 'JPMorgan Chase', market: 'US' },
      { symbol: 'BAC', name: 'Bank of America', market: 'US' },
      { symbol: 'WFC', name: 'Wells Fargo', market: 'US' },
      { symbol: 'GS', name: 'Goldman Sachs', market: 'US' },
      { symbol: 'MS', name: 'Morgan Stanley', market: 'US' },
      { symbol: 'C', name: 'Citigroup', market: 'US' },
      { symbol: 'BLK', name: 'BlackRock', market: 'US' },
      { symbol: 'AXP', name: 'American Express', market: 'US' },
      { symbol: 'V', name: 'Visa', market: 'US' },
      { symbol: 'MA', name: 'Mastercard', market: 'US' },
      { symbol: 'PYPL', name: 'PayPal', market: 'US' },
    ],
  },
  {
    name: 'Communication Services',
    stocks: [
      { symbol: 'T', name: 'AT&T', market: 'US' },
      { symbol: 'VZ', name: 'Verizon', market: 'US' },
      { symbol: 'CMCSA', name: 'Comcast', market: 'US' },
      { symbol: 'NFLX', name: 'Netflix', market: 'US' },
      { symbol: 'DIS', name: 'Disney', market: 'US' },
      { symbol: 'TMUS', name: 'T-Mobile', market: 'US' },
    ],
  },
  {
    name: 'Consumer Cyclical',
    stocks: [
      { symbol: 'AMZN', name: 'Amazon', market: 'US' },
      { symbol: 'HD', name: 'Home Depot', market: 'US' },
      { symbol: 'MCD', name: "McDonald's", market: 'US' },
      { symbol: 'NKE', name: 'Nike', market: 'US' },
      { symbol: 'SBUX', name: 'Starbucks', market: 'US' },
      { symbol: 'TGT', name: 'Target', market: 'US' },
      { symbol: 'LOW', name: "Lowe's", market: 'US' },
      { symbol: 'F', name: 'Ford', market: 'US' },
      { symbol: 'GM', name: 'General Motors', market: 'US' },
    ],
  },
  {
    name: 'Consumer Defensive',
    stocks: [
      { symbol: 'WMT', name: 'Walmart', market: 'US' },
      { symbol: 'PG', name: 'Procter & Gamble', market: 'US' },
      { symbol: 'KO', name: 'Coca-Cola', market: 'US' },
      { symbol: 'PEP', name: 'PepsiCo', market: 'US' },
      { symbol: 'COST', name: 'Costco', market: 'US' },
      { symbol: 'PM', name: 'Philip Morris', market: 'US' },
    ],
  },
  {
    name: 'HealthCare',
    stocks: [
      { symbol: 'UNH', name: 'UnitedHealth', market: 'US' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'US' },
      { symbol: 'LLY', name: 'Eli Lilly', market: 'US' },
      { symbol: 'ABBV', name: 'AbbVie', market: 'US' },
      { symbol: 'MRK', name: 'Merck', market: 'US' },
      { symbol: 'PFE', name: 'Pfizer', market: 'US' },
      { symbol: 'TMO', name: 'Thermo Fisher', market: 'US' },
      { symbol: 'DHR', name: 'Danaher', market: 'US' },
      { symbol: 'CVS', name: 'CVS Health', market: 'US' },
    ],
  },
  {
    name: 'Industrials',
    stocks: [
      { symbol: 'BA', name: 'Boeing', market: 'US' },
      { symbol: 'CAT', name: 'Caterpillar', market: 'US' },
      { symbol: 'GE', name: 'General Electric', market: 'US' },
      { symbol: 'UPS', name: 'UPS', market: 'US' },
      { symbol: 'HON', name: 'Honeywell', market: 'US' },
      { symbol: 'RTX', name: 'Raytheon', market: 'US' },
      { symbol: 'LMT', name: 'Lockheed Martin', market: 'US' },
      { symbol: 'DE', name: 'Deere & Company', market: 'US' },
    ],
  },
  {
    name: 'Basic Materials',
    stocks: [
      { symbol: 'LIN', name: 'Linde', market: 'US' },
      { symbol: 'APD', name: 'Air Products', market: 'US' },
      { symbol: 'ECL', name: 'Ecolab', market: 'US' },
      { symbol: 'DD', name: 'DuPont', market: 'US' },
      { symbol: 'NEM', name: 'Newmont', market: 'US' },
      { symbol: 'FCX', name: 'Freeport-McMoRan', market: 'US' },
    ],
  },
  {
    name: 'Argentina - Energy',
    stocks: [
      { symbol: 'YPF', name: 'YPF', market: 'US' }, // ADR en NYSE
      { symbol: 'YPFD.BA', name: 'YPF', market: 'AR' },
      { symbol: 'TGSU2.BA', name: 'Transportadora Gas Sur', market: 'AR' },
      { symbol: 'TGNO4.BA', name: 'Transportadora Gas Norte', market: 'AR' },
      { symbol: 'CGPA2.BA', name: 'Camuzzi Gas Pampeana', market: 'AR' },
    ],
  },
  {
    name: 'Argentina - Financial',
    stocks: [
      { symbol: 'GGAL', name: 'Grupo Galicia', market: 'US' }, // ADR
      { symbol: 'BMA', name: 'Banco Macro', market: 'US' }, // ADR
      { symbol: 'GGAL.BA', name: 'Grupo Galicia', market: 'AR' },
      { symbol: 'BMA.BA', name: 'Banco Macro', market: 'AR' },
      { symbol: 'COME.BA', name: 'Banco Comafi', market: 'AR' },
      { symbol: 'BBAR.BA', name: 'Banco BBVA', market: 'AR' },
      { symbol: 'SUPV.BA', name: 'Banco Supervielle', market: 'AR' },
    ],
  },
  {
    name: 'Argentina - Utilities',
    stocks: [
      { symbol: 'EDN', name: 'Edenor', market: 'US' }, // ADR
      { symbol: 'PAM', name: 'Pampa Energía', market: 'US' }, // ADR
      { symbol: 'EDN.BA', name: 'Edenor', market: 'AR' },
      { symbol: 'PAMP.BA', name: 'Pampa Energía', market: 'AR' },
      { symbol: 'CECO2.BA', name: 'Central Costanera', market: 'AR' },
      { symbol: 'CEPU.BA', name: 'Central Puerto', market: 'AR' },
    ],
  },
  {
    name: 'Argentina - Telecom & Tech',
    stocks: [
      { symbol: 'TEO', name: 'Telecom Argentina', market: 'US' }, // ADR
      { symbol: 'LOMA', name: 'Loma Negra', market: 'US' }, // ADR
      { symbol: 'TECO2.BA', name: 'Telecom Argentina', market: 'AR' },
      { symbol: 'LOMA.BA', name: 'Loma Negra', market: 'AR' },
      { symbol: 'MIRG.BA', name: 'Mirgor', market: 'AR' },
    ],
  },
  {
    name: 'Argentina - Consumer & Industrial',
    stocks: [
      { symbol: 'ALUA.BA', name: 'Aluar', market: 'AR' },
      { symbol: 'TXAR.BA', name: 'Ternium', market: 'AR' },
      { symbol: 'CRES.BA', name: 'Cresud', market: 'AR' },
      { symbol: 'AGRO.BA', name: 'Agrometal', market: 'AR' },
      { symbol: 'IRSA.BA', name: 'IRSA', market: 'AR' },
      { symbol: 'BYMA.BA', name: 'BYMA', market: 'AR' },
    ],
  },
];

