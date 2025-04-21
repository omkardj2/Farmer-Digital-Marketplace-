// API documentation: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = 'YOUR_API_KEY'; // You'll need to get this from data.gov.in

export interface MarketPrice {
  commodity: string;
  state: string;
  market: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_date: string;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function fetchMarketPrices(commodity?: string): Promise<MarketPrice[]> {
  const today = new Date();
  const formattedDate = formatDate(today);

  try {
    const params = new URLSearchParams({
      'api-key': API_KEY,
      format: 'json',
      limit: '100',
      filters: JSON.stringify({
        arrival_date: formattedDate,
        ...(commodity ? { commodity: commodity.toUpperCase() } : {})
      })
    });

    const response = await fetch(`${API_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch market prices');
    }

    const data = await response.json();
    return data.records.map((record: any) => ({
      commodity: record.commodity,
      state: record.state,
      market: record.market,
      modal_price: parseFloat(record.modal_price),
      min_price: parseFloat(record.min_price),
      max_price: parseFloat(record.max_price),
      arrival_date: record.arrival_date,
    }));
  } catch (error) {
    console.error('Error fetching market prices:', error);
    
    // Return mock data for demonstration
    return [
      {
        commodity: 'Rice',
        state: 'Maharashtra',
        market: 'Mumbai',
        modal_price: 3000,
        min_price: 2800,
        max_price: 3200,
        arrival_date: formattedDate,
      },
      {
        commodity: 'Wheat',
        state: 'Punjab',
        market: 'Amritsar',
        modal_price: 2500,
        min_price: 2300,
        max_price: 2700,
        arrival_date: formattedDate,
      },
      {
        commodity: 'Soybean',
        state: 'Madhya Pradesh',
        market: 'Indore',
        modal_price: 4200,
        min_price: 4000,
        max_price: 4500,
        arrival_date: formattedDate,
      },
      {
        commodity: 'Cotton',
        state: 'Gujarat',
        market: 'Ahmedabad',
        modal_price: 6000,
        min_price: 5800,
        max_price: 6500,
        arrival_date: formattedDate,
      }
    ];
  }
}
