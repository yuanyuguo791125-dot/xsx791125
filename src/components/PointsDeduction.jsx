// @ts-ignore;
import React, { useState, useEffect, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Switch } from '@/components/ui';

export const PointsDeduction = memo(({
  points,
  maxDeduction,
  usePoints,
  onToggle,
  onAmountChange
}) => {
  const [inputValue, setInputValue] = useState(0);
  useEffect(() => {
    setInputValue(usePoints ? Math.min(points, maxDeduction * 100) : 0);
  }, [usePoints, points, maxDeduction]);
  const handleInputChange = value => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.min(numValue, Math.min(points, maxDeduction * 100));
    setInputValue(clampedValue);
    onAmountChange(clampedValue);
  };
  return <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-purple-800">积分抵扣</h4>
            <p className="text-sm text-purple-600">可用积分: {points}</p>
          </div>
          <Switch checked={usePoints} onCheckedChange={onToggle} className="data-[state=checked]:bg-purple-600" />
        </div>
        
        {usePoints && <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="number" value={inputValue} onChange={e => handleInputChange(e.target.value)} className="w-24 px-2 py-1 border rounded text-sm" min="0" max={Math.min(points, maxDeduction * 100)} step="100" />
              <span className="text-sm text-gray-600">积分</span>
              <span className="text-sm text-gray-600 ml-auto">
                抵扣 ¥{(inputValue / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              100积分=1元，最多可抵扣¥{maxDeduction}
            </p>
          </div>}
      </CardContent>
    </Card>;
});