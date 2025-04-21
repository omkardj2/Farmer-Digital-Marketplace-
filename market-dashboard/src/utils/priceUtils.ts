export interface PriceEntry {
  id: number;
  cropName: string;
  location: string;
  price: number;
  date: string;
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const sortPrices = (
  prices: PriceEntry[],
  field: keyof PriceEntry,
  direction: 'asc' | 'desc'
): PriceEntry[] => {
  return [...prices].sort((a, b) => {
    if (direction === 'asc') {
      return a[field] > b[field] ? 1 : -1;
    }
    return a[field] < b[field] ? 1 : -1;
  });
};

export const filterPrices = (
  prices: PriceEntry[],
  filters: {
    cropName?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): PriceEntry[] => {
  return prices.filter((price) => {
    if (filters.cropName && !price.cropName.toLowerCase().includes(filters.cropName.toLowerCase())) {
      return false;
    }
    if (filters.location && !price.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.minPrice && price.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && price.price > filters.maxPrice) {
      return false;
    }
    return true;
  });
};
