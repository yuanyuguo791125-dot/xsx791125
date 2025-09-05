// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart } from 'lucide-react';

export const EmptyCart = ({
  onNavigate
}) => {
  return <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-32 h-32 mb-6">
        <img src="https://via.placeholder.com/128x128/3B82F6/FFFFFF?text=Empty+Cart" alt="空购物车" className="w-full h-full object-contain opacity-60" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">购物车空空如也</h3>
      <p className="text-gray-500 mb-6 text-center">
        快去挑选心仪的商品吧
      </p>
      <Button onClick={onNavigate} className="bg-blue-600 hover:bg-blue-700">
        <ShoppingCart className="w-4 h-4 mr-2" />
        去购物
      </Button>
    </div>;
};