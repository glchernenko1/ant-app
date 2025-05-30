// Mock data
const mockFiats = ['USD', 'EUR', 'RUB', ];
const mockExchanges = ['Binance', 'Bybit'];

// Mock banks for each exchange
const mockExchangeBanks: Record<string, string[]> = {
  'Binance': ['Tinkoff', 'Sberbank', 'Raiffeisen', 'Alfa Bank'],
  "Bybit": ["Tinkoff", "Sberbank", "Raiffeisen", "Alfa Bank"],
};

// Types
export interface Filter {
  min_amount: number;
  max_amount: number;
  min_price: number;
  max_price: number;
  payment_methods: string[];
}

export interface ExchangeParser {
  exchange_name: string;
  banks: string[];
  filter_buy: Filter;
  filter_sell: Filter;
}

export interface ExchangeSoup {
  name: string;
  average: number;
  exchanges: ExchangeParser[];
}

export interface Fiat {
  name: string;
  exchange_soups: ExchangeSoup[];
}

// Local Storage Keys
const STORAGE_KEY = 'fiat_settings';

// API Service
export const api = {
  // Get available fiats
  getFiats: async (): Promise<string[]> => {
    return Promise.resolve(mockFiats);
  },

  // Get available exchanges for a fiat
  getExchanges: async (): Promise<string[]> => {
    return Promise.resolve(mockExchanges);
  },

  // Get available banks for a fiat and exchange
  getBanks: async (_: string, exchange: string): Promise<string[]> => {
    return Promise.resolve(mockExchangeBanks[exchange] || []);
  },

  // Get saved settings
  getSavedSettings: (): Record<string, Fiat> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  },

  // Save settings
  saveSettings: (fiat: Fiat): void => {
    const saved = api.getSavedSettings();
    saved[fiat.name] = fiat;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  },

  // Create new fiat with settings
  createFiat: async (fiat: Fiat): Promise<void> => {
    console.log('Creating fiat:', fiat);
    api.saveSettings(fiat);
    return Promise.resolve();
  },

  // Create new exchange soup
  createSoup: async (fiat: string, soup: ExchangeSoup): Promise<void> => {
    console.log('Creating soup for fiat:', fiat, soup);
    const saved = api.getSavedSettings();
    if (saved[fiat]) {
      saved[fiat].exchange_soups.push(soup);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
    return Promise.resolve();
  },

  // Create new exchange parser
  createExchangeParser: async (soupId: number, parser: ExchangeParser): Promise<void> => {
    console.log('Creating exchange parser for soup:', soupId, parser);
    return Promise.resolve();
  },

  // Delete fiat
  deleteFiat: async (fiat: string): Promise<void> => {
    console.log('Deleting fiat:', fiat);
    const saved = api.getSavedSettings();
    delete saved[fiat];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return Promise.resolve();
  },

  // Delete exchange parser
  deleteExchangeParser: async (parserId: number): Promise<void> => {
    console.log('Deleting exchange parser:', parserId);
    return Promise.resolve();
  },

  // Delete soup
  deleteSoup: async (soupId: number): Promise<void> => {
    console.log('Deleting soup:', soupId);
    return Promise.resolve();
  }
}; 