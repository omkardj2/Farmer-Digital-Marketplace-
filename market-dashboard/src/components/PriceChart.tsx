import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MarketPrice } from '../services/marketApi';

interface PriceChartProps {
  prices: MarketPrice[];
}

const PriceChart: React.FC<PriceChartProps> = ({ prices }) => {
  // Group prices by commodity for comparison
  const chartData = prices.reduce((acc: any[], price) => {
    const existingData = acc.find(
      (item) => item.commodity === price.commodity
    );

    if (existingData) {
      existingData.modalPrice = Math.max(existingData.modalPrice, price.modal_price);
      existingData.minPrice = Math.min(existingData.minPrice, price.min_price);
      existingData.maxPrice = Math.max(existingData.maxPrice, price.max_price);
    } else {
      acc.push({
        commodity: price.commodity,
        modalPrice: price.modal_price,
        minPrice: price.min_price,
        maxPrice: price.max_price,
      });
    }

    return acc;
  }, []);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="commodity" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="modalPrice"
            stroke="#22c55e"
            name="Modal Price"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="minPrice"
            stroke="#64748b"
            name="Min Price"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="maxPrice"
            stroke="#0ea5e9"
            name="Max Price"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
