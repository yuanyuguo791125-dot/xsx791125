// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast, Switch } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Wallet, Gift, Shield, CheckCircle, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
const PaymentMethodCard = memo(({
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
const PointsDeduction = memo(({
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
export default function Payment(props) {
  const {
    $w
  } = props;
  const orderId = $w.page.dataset.params.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('wechat');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [processing, setProcessing] = useState(false);
  const {
    toast
  } = useToast();
  const paymentMethods = [{
    type: 'wechat',
    name: '微信支付',
    description: '推荐使用，安全便捷'
  }, {
    type: 'balance',
    name: '余额支付',
    description: '使用账户余额支付'
  }, {
    type: 'points',
    name: '积分抵扣',
    description: '使用积分抵扣部分金额'
  }];
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const [orderResult, userResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              orderId: {
                $eq: orderId
              }
            }
          },
          select: {
            $master: true
          }
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'demo_user'
              }
            }
          },
          select: {
            $master: true
          }
        }
      })]);
      setOrder(orderResult);
      setUserBalance(userResult?.balance || 0);
      setUserPoints(userResult?.points || 0);
    } catch (error) {
      toast({
        title: "获取订单失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);
  const finalAmount = useMemo(() => {
    if (!order) return 0;
    return Math.max(0, order.payAmount - pointsAmount / 100);
  }, [order, pointsAmount]);
  const handlePayment = useCallback(async () => {
    if (processing) return;
    if (selectedMethod === 'balance' && userBalance < finalAmount) {
      toast({
        title: "余额不足",
        description: "请充值或选择其他支付方式",
        variant: "destructive"
      });
      return;
    }
    setProcessing(true);
    try {
      // 创建支付记录
      await $w.cloud.callDataSource({
        dataSourceName: 'payment',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            orderId: orderId,
            amount: finalAmount,
            method: selectedMethod,
            pointsUsed: usePoints ? pointsAmount : 0,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      });

      // 更新订单状态
      await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'paid'
          },
          filter: {
            where: {
              orderId: {
                $eq: orderId
              }
            }
          }
        }
      });
      toast({
        title: "支付成功",
        description: "订单已支付完成"
      });
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'orderDetail',
          params: {
            orderId
          }
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "支付失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  }, [orderId, selectedMethod, finalAmount, pointsAmount, usePoints, processing]);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="payment" />
      </div>;
  }
  if (!order) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">订单不存在</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        {/* 订单信息 */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">订单号</span>
              <span>{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">商品金额</span>
              <span>¥{order.totalAmount}</span>
            </div>
            {order.discountAmount > 0 && <div className="flex justify-between">
                <span className="text-gray-600">优惠金额</span>
                <span className="text-green-600">-¥{order.discountAmount}</span>
              </div>}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>应付金额</span>
              <span className="text-red-600">¥{order.payAmount}</span>
            </div>
          </CardContent>
        </Card>

        {/* 支付方式选择 */}
        <div className="space-y-3">
          <h3 className="font-semibold">选择支付方式</h3>
          {paymentMethods.map(method => <PaymentMethodCard key={method.type} method={method} isSelected={selectedMethod === method.type} onSelect={setSelectedMethod} balance={userBalance} points={userPoints} />)}
        </div>

        {/* 积分抵扣 */}
        {selectedMethod === 'points' && userPoints > 0 && <PointsDeduction points={userPoints} maxDeduction={order.payAmount} usePoints={usePoints} onToggle={setUsePoints} onAmountChange={setPointsAmount} />}

        {/* 支付金额汇总 */}
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>商品金额</span>
                <span>¥{order.payAmount}</span>
              </div>
              {usePoints && pointsAmount > 0 && <div className="flex justify-between text-green-600">
                  <span>积分抵扣</span>
                  <span>-¥{(pointsAmount / 100).toFixed(2)}</span>
                </div>}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>实付金额</span>
                <span className="text-red-600">¥{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安全提示 */}
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Shield className="w-4 h-4" />
              <span>支付安全由微信支付保障</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 支付按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <Button className="w-full h-12 text-base" onClick={handlePayment} disabled={processing}>
          {processing ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              处理中...
            </> : `确认支付 ¥${finalAmount.toFixed(2)}`}
        </Button>
      </div>
    </div>;
}