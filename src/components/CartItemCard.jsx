// @ts-ignore;
import React, { useState, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Plus, Minus, Trash2 } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
export const CartItemCard = memo(({
  item,
  onUpdate,
  onRemove,
  onSelect,
  isSelected
}) => {
  const handleQuantityChange = useCallback(newQuantity => {
    if (newQuantity >= 1 && newQuantity <= (item.stock || 999)) {
      onUpdate(item._id, {
        quantity: newQuantity
      });
    }
  }, [item._id, item.stock, onUpdate]);
  const handleSelect = useCallback(checked => {
    onSelect(item._id, checked);
  }, [item._id, onSelect]);
  return <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Checkbox checked={isSelected} onCheckedChange={handleSelect} className="mt-8" />
          
          <LazyImage src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded" />
          
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.productName}</h3>
            <p className="text-red-600 font-bold text-lg">¥{item.price}</p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1}>
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={item.quantity >= (item.stock || 999)}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => onRemove(item._id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {item.stock && item.stock < 10 && <p className="text-xs text-orange-600 mt-1">
                仅剩 {item.stock} 件
              </p>}
          </div>
        </div>
      </CardContent>
    </Card>;
});