// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Star, ShoppingCart } from 'lucide-react';

export function ProductCard({
  product
}) {
  return <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />)}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.sales})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-600">¥{product.price}</span>
          <button className="p-1 bg-blue-600 text-white rounded">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>;
}