import React, { useState } from 'react';
import './styles/dashboard.css';
import { usePrices } from './hooks/usePrices';
import PriceTable from './components/PriceTable';
import PriceChart from './components/PriceChart';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Search } from 'lucide-react';

import type { MarketPrice } from './services/marketApi';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { prices, loading, error, sortPrices } = usePrices();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Market Price Dashboard
            </h1>
          </div>
        </div>
      </nav>
      
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Summary Cards */}
            <Card className="price-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Total Commodities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{loading ? '-' : prices.length}</div>
              </CardContent>
            </Card>

            <Card className="price-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : `₹${Math.round(prices.reduce((acc, curr) => acc + curr.modal_price, 0) / prices.length)}`}
                </div>
              </CardContent>
            </Card>

            <Card className="price-card md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Price Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : `₹${Math.min(...prices.map(p => p.min_price))} - ₹${Math.max(...prices.map(p => p.max_price))}`}
                </div>
              </CardContent>
            </Card>

            {/* Price Chart Card */}
            <Card className="price-card col-span-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Price Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="loading-spinner" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-8">{error}</div>
                ) : (
                  <PriceChart prices={prices} />
                )}
              </CardContent>
            </Card>

            {/* Price Table Card */}
            <Card className="price-card col-span-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Current Market Prices</CardTitle>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search crops..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg price-input w-64"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="loading-spinner" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-8">{error}</div>
                ) : (
                  <PriceTable 
                    prices={prices} 
                    onSort={sortPrices}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
