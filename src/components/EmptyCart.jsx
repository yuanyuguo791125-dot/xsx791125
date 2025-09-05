// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart } from 'lucide-react';

export const EmptyCart = ({
  onBrowse
}) => {
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">购物车空空如也</h3>
        <p className="text-gray-500 mb-6">快去挑选心仪的商品吧</p>
        <Button onClick={onBrowse}>
          去逛逛
        </Button>
      </div>
    </div>;
};