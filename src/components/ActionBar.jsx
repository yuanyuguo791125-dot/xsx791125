// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Heart, ShoppingCart, Users } from 'lucide-react';

export function ActionBar({
  isFavorited,
  onFavoriteToggle,
  onAddToCart,
  onGroupBuy
}) {
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <button onClick={onFavoriteToggle} className={`p-3 rounded-lg border ${isFavorited ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-600 border-gray-200'}`}>
          <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
        </button>
        
        <button onClick={onAddToCart} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium">
          <ShoppingCart size={20} className="inline mr-2" />
          加入购物车
        </button>
        
        <button onClick={onGroupBuy} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium">
          <Users size={20} className="inline mr-2" />
          发起拼团
        </button>
      </div>
    </div>;
}