// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { TrendingUp, TrendingDown, Gift, ShoppingBag } from 'lucide-react';

export function PointsHistory({
  history
}) {
  const getIcon = type => {
    switch (type) {
      case 'earn':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'spend':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'gift':
        return <Gift size={16} className="text-purple-600" />;
      default:
        return <ShoppingBag size={16} className="text-blue-600" />;
    }
  };
  const getColor = type => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };
  return <div className="bg-white rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-3">积分明细</h3>
      <div className="space-y-3">
        {history.map((item, index) => <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getIcon(item.type)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getColor(item.type)}`}>
              {item.type === 'earn' ? '+' : '-'}{item.points}
            </span>
          </div>)}
      </div>
    </div>;
}