// @ts-ignore;
import React, { memo, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Trash2, Plus, Minus, Package } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
export const CartItemCard = memo(({
  item,
  onUpdate,
  onRemove,
  onSelect
}) => {
  const handleQuantityChange = useCallback(newQuantity => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
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
        <div className="flex gap-3">
          <div className="flex items-center">
            <Checkbox checked={item.selected} onCheckedChange={handleSelect} />
          </div>
          
          <LazyImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h4>
            <p className="text-xs text-gray-500 mb-2">{item.specifications || '默认规格'}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-red-600">¥{item.price}</span>
              
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1}>
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={item.quantity >= item.stock}>
                  <Plus className="w-3 h-3" />
                </Button>
                
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-2" onClick={() => onRemove(item._id)}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </div>
            
            {item.stock <= 10 && <p className="text-xs text-orange-600 mt-1">库存紧张：仅剩{item.stock}件</p>}
          </div>
        </div>
      </CardContent>
    </Card>;
});