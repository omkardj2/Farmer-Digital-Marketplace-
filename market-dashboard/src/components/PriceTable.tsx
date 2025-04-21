import React from 'react';
import type { MarketPrice } from '../services/marketApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ArrowUpDown } from 'lucide-react';

interface PriceEntry {
  id: number;
  cropName: string;
  location: string;
  price: number;
  date: string;
}

interface PriceTableProps {
  prices: MarketPrice[];
  onSort?: (field: keyof MarketPrice) => void;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, onSort }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead 
              onClick={() => onSort?.('commodity')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Commodity
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => onSort?.('state')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                State
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => onSort?.('market')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Market
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => onSort?.('modal_price')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors text-right"
            >
              <div className="flex items-center gap-2 justify-end">
                Modal Price
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => onSort?.('min_price')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors text-right"
            >
              <div className="flex items-center gap-2 justify-end">
                Min Price
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => onSort?.('max_price')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors text-right"
            >
              <div className="flex items-center gap-2 justify-end">
                Max Price
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead 
              onClick={() => onSort?.('arrival_date')} 
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Arrival Date
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((price, index) => (
            <TableRow 
              key={index}
              className="hover:bg-gray-50 transition-colors"
            >
              <TableCell className="font-medium">{price.commodity}</TableCell>
              <TableCell>{price.state}</TableCell>
              <TableCell>{price.market}</TableCell>
              <TableCell className="text-right font-medium text-green-600">
                {formatPrice(price.modal_price)}
              </TableCell>
              <TableCell className="text-right text-gray-600">
                {formatPrice(price.min_price)}
              </TableCell>
              <TableCell className="text-right text-gray-600">
                {formatPrice(price.max_price)}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDate(price.arrival_date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PriceTable;
