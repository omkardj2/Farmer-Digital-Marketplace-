import { useState, useEffect } from 'react';
import { fetchMarketPrices, MarketPrice } from '../services/marketApi';
import type { PriceEntry } from '../utils/priceUtils';

interface UsePricesReturn {
  prices: MarketPrice[];
  loading: boolean;
  error: string | null;
  sortPrices: (field: keyof MarketPrice) => void;
  filterPrices: (filters: {
    commodity?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

export const usePrices = (): UsePricesReturn => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: keyof MarketPrice;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const data = await fetchMarketPrices();
        setPrices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, []);

  

  const sortPrices = (field: keyof MarketPrice) => {
    const direction = sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });

    setPrices([...prices].sort((a, b) => {
      if (direction === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      }
      return a[field] < b[field] ? 1 : -1;
    }));
  };

  const filterPrices = (filters: {
    commodity?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const filtered = prices.filter((price) => {
      if (filters.commodity && !price.commodity.toLowerCase().includes(filters.commodity.toLowerCase())) {
        return false;
      }
      if (filters.state && !price.state.toLowerCase().includes(filters.state.toLowerCase())) {
        return false;
      }
      if (filters.minPrice && price.modal_price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && price.modal_price > filters.maxPrice) {
        return false;
      }
      return true;
    });

    setPrices(filtered);
  };

  return {
    prices,
    loading,
    error,
    sortPrices,
    filterPrices,
  };
};

// Toast notification helper
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
