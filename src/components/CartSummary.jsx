// @ts-ignore;
import React, { useMemo, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart } from 'lucide-react';

export const CartSummary = memo(({
  items,
  selectedItems,
  onCheckout,
  onBatchDelete
}) => {
  const selectedItemsData = useMemo(() => items.filter(item => selectedItems.includes(item._id)), [items, selectedItems]);
  const totalAmount = useMemo(() => selectedItemsData.reduce((sum, item) => sum + item.price * item.quantity, 0), [selectedItemsData]);
  const totalItems = useMemo(() => selectedItemsData.reduce((sum, item) => sum + item.quantity, 0), [selectedItemsData]);
  return <Card className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">已选 {totalItems} 件商品</p>
            <p className="text-xl font-bold text-red-600">¥{totalAmount.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && <Button variant="outline" size="sm" onClick={onBatchDelete} className="text-red-600 border-red-600">
                <ShoppingCart className="w-4 h-4 mr-1" />
                删除
              </Button>}
            <Button onClick={onCheckout} disabled={selectedItems.length === 0} className="bg-blue-600 hover:bg-blue-700">
              去结算 ({selectedItems.length})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
});