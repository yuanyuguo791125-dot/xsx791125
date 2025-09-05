// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ChevronRight } from 'lucide-react';

export function CartSummary({
  totalAmount,
  pointsDiscount,
  usePoints,
  onTogglePoints,
  onCheckout
}) {
  const finalAmount = totalAmount - (usePoints ? pointsDiscount : 0);
  return <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm">全选</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600">合计：</span>
          <span className="text-lg font-bold text-red-600">¥{finalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      {/* 积分抵扣 */}
      <div className="flex items-center justify-between mb-3 p-3 bg-purple-50 rounded-lg">
        <div>
          <span className="text-sm font-medium text-purple-800">积分抵扣</span>
          <span className="text-xs text-purple-600 ml-2">可用积分抵扣¥{pointsDiscount}</span>
        </div>
        <button onClick={onTogglePoints} className={`w-10 h-6 rounded-full transition-colors ${usePoints ? 'bg-purple-600' : 'bg-gray-300'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${usePoints ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      
      <button onClick={onCheckout} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
        结算 ({finalAmount.toFixed(2)})
      </button>
    </div>;
}