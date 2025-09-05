// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Clock, Users, Search } from 'lucide-react';

export function GroupCard({
  product,
  onClick
}) {
  const [timeLeft, setTimeLeft] = useState(product.timeLeft);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const progress = product.joined / product.required * 100;
  return <div onClick={onClick} className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
      <div className="flex">
        <img src={product.image} alt={product.name} className="w-24 h-24 object-cover" />
        <div className="flex-1 p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-baseline mb-2">
            <span className="text-lg font-bold text-orange-600">¥{product.groupPrice}</span>
            <span className="text-sm text-gray-500 line-through ml-2">¥{product.originalPrice}</span>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>已拼{product.joined}人</span>
              <span>需{product.required}人成团</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full" style={{
              width: `${progress}%`
            }} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-red-600">
              <Clock size={12} className="mr-1" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
              去拼团
            </button>
          </div>
        </div>
      </div>
    </div>;
}