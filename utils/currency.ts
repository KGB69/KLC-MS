import { Currency } from '../types';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}

export const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  [Currency.USD]: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.UGX]: {
    symbol: 'UGX',
    code: 'UGX',
    name: 'Ugandan Shilling',
    decimals: 0,
    symbolPosition: 'before'
  },
  [Currency.EUR]: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.GBP]: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.KES]: {
    symbol: 'KSh',
    code: 'KES',
    name: 'Kenyan Shilling',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.TZS]: {
    symbol: 'TSh',
    code: 'TZS',
    name: 'Tanzanian Shilling',
    decimals: 0,
    symbolPosition: 'before'
  },
  [Currency.RWF]: {
    symbol: 'FRw',
    code: 'RWF',
    name: 'Rwandan Franc',
    decimals: 0,
    symbolPosition: 'before'
  },
  [Currency.ZAR]: {
    symbol: 'R',
    code: 'ZAR',
    name: 'South African Rand',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.NGN]: {
    symbol: '₦',
    code: 'NGN',
    name: 'Nigerian Naira',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.GHS]: {
    symbol: 'GH₵',
    code: 'GHS',
    name: 'Ghanaian Cedi',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.JPY]: {
    symbol: '¥',
    code: 'JPY',
    name: 'Japanese Yen',
    decimals: 0,
    symbolPosition: 'before'
  },
  [Currency.CNY]: {
    symbol: '¥',
    code: 'CNY',
    name: 'Chinese Yuan',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.INR]: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.AUD]: {
    symbol: 'A$',
    code: 'AUD',
    name: 'Australian Dollar',
    decimals: 2,
    symbolPosition: 'before'
  },
  [Currency.CAD]: {
    symbol: 'C$',
    code: 'CAD',
    name: 'Canadian Dollar',
    decimals: 2,
    symbolPosition: 'before'
  }
};

/**
 * Format an amount with the appropriate currency symbol and formatting
 */
export function formatCurrency(amount: number | undefined | null, currency: Currency | undefined = Currency.USD): string {
  if (amount === undefined || amount === null) {
    amount = 0;
  }

  // Default to USD if currency is undefined
  const currencyToUse = currency || Currency.USD;
  const config = CURRENCY_CONFIG[currencyToUse];

  if (!config) {
    // Fallback to USD if config not found
    const usdConfig = CURRENCY_CONFIG[Currency.USD];
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: usdConfig.decimals,
      maximumFractionDigits: usdConfig.decimals
    });
    return `${usdConfig.symbol}${formattedAmount}`;
  }

  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  });

  if (config.symbolPosition === 'before') {
    return `${config.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${config.symbol}`;
  }
}

/**
 * Get the currency symbol for a given currency
 */
export function getCurrencySymbol(currency: Currency | undefined): string {
  if (!currency || !CURRENCY_CONFIG[currency]) {
    return CURRENCY_CONFIG[Currency.USD].symbol;
  }
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Get the currency name for a given currency
 */
export function getCurrencyName(currency: Currency | undefined): string {
  if (!currency || !CURRENCY_CONFIG[currency]) {
    return CURRENCY_CONFIG[Currency.USD].name;
  }
  return CURRENCY_CONFIG[currency].name;
}

/**
 * Get all available currencies
 */
export function getAllCurrencies(): Currency[] {
  return Object.values(Currency);
}

/**
 * Get the default currency from localStorage or return USD
 */
export function getDefaultCurrency(): Currency {
  const stored = localStorage.getItem('preferredCurrency');
  if (stored && Object.values(Currency).includes(stored as Currency)) {
    return stored as Currency;
  }
  return Currency.USD;
}

/**
 * Set the default currency in localStorage
 */
export function setDefaultCurrency(currency: Currency): void {
  localStorage.setItem('preferredCurrency', currency);
}
