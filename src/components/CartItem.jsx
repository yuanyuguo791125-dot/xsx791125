// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Trash2, Heart, Minus, Plus, Users } from 'lucide-react';

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onToggleSelect,
  isSelected
}) {
  return <div className="bg-white p-4 mb-2 flex items-center">
      {/* 选择按钮 */}
      <button onClick={() => onToggleSelect(item.id)} className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
      </button>
      
      {/* 商品图片 */}
      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
      
      {/* 商品信息 */}
      <div className="flex-1 ml-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h3>
        
        {item.isGroup && <div className="flex items-center mt-1">
            <Users size={12} className="text-orange-500 mr-1" />
            <span className="text-xs text-orange-500">拼团商品</span>
          </div>}
        
        <div className="flex items-baseline mt-2">
          <span className="text-lg font-bold text-red-600">¥{item.price}</span>
          {item.originalPrice && <span className="text-sm text-gray-500 line-through ml-2">¥{item.originalPrice}</span>}
        </div>
        
        {/* 数量选择器 */}
        <div className="flex items-center mt-2">
          <button onClick={() => onQuantityChange(item.id, -1)} disabled={item.quantity <= 1} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button onClick={() => onQuantityChange(item.id, 1)} disabled={item.quantity >= item.stock} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50">
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex flex-col space-y-2 ml-2">
        <button onClick={() => onRemove(item.id)} className="text-gray-400">
          <Trash2 size={18} />
        </button>
        <button className="text-gray-400">
          <Heart size={18} />
        </button>
      </div>
    </div>;
}