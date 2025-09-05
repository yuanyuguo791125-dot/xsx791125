// @ts-ignore;
import React, { memo } from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Wallet, Gift, CheckCircle } from 'lucide-react';

export const PaymentMethodCard = memo(({
  method,
  isSelected,
  onSelect,
  balance,
  points
}) => {
  const icons = {
    wechat: CreditCard,
    balance: Wallet,
    points: Gift
  };
  const Icon = icons[method.type];
  return <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-blue-300'}`} onClick={() => onSelect(method.type)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.type === 'wechat' ? 'bg-green-100' : method.type === 'balance' ? 'bg-blue-100' : 'bg-purple-100'}`}>
          <Icon className={`w-6 h-6 ${method.type === 'wechat' ? 'text-green-600' : method.type === 'balance' ? 'text-blue-600' : 'text-purple-600'}`} />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold">{method.name}</h4>
          <p className="text-sm text-gray-600">{method.description}</p>
          {method.type === 'balance' && balance !== undefined && <p className="text-xs text-gray-500 mt-1">可用余额: ¥{balance}</p>}
          {method.type === 'points' && points !== undefined && <p className="text-xs text-gray-500 mt-1">可用积分: {points}</p>}
        </div>
        
        {isSelected && <CheckCircle className="w-5 h-5 text-blue-500" />}
      </CardContent>
    </Card>;
});