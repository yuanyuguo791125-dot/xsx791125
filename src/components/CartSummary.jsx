// @ts-ignore;
import React, { memo, useMemo } from 'react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart } from 'lucide-react';

export const CartSummary = memo(({
  items,
  selectedItems,
  onCheckout
}) => {
  const summary = useMemo(() => {
    const selected = items.filter(item => selectedItems.includes(item._id));
    const totalAmount = selected.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCount = selected.reduce((sum, item) => sum + item.quantity, 0);
    const savings = selected.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
    return {
      totalAmount,
      totalCount,
      savings,
      selectedCount: selected.length
    };
  }, [items, selectedItems]);
  return <Card className="sticky bottom-20 bg-white">
      <CardContent className="p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>已选商品</span>
            <span>{summary.selectedCount}件</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>商品总价</span>
            <span>¥{summary.totalAmount.toFixed(2)}</span>
          </div>
          {summary.savings > 0 && <div className="flex justify-between text-sm text-green-600">
              <span>已优惠</span>
              <span>-¥{summary.savings.toFixed(2)}</span>
            </div>}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>合计</span>
            <span className="text-red-600">¥{summary.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <Button className="w-full h-12 text-base" onClick={onCheckout} disabled={summary.selectedCount === 0}>
          <ShoppingCart className="w-5 h-5 mr-2" />
          结算 ({summary.totalCount})
        </Button>
      </CardContent>
    </Card>;
});