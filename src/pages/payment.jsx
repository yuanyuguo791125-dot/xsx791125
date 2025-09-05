// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast, Switch } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Wallet, Gift, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
// @ts-ignore;
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
// @ts-ignore;
import { PointsDeduction } from '@/components/PointsDeduction';
// @ts-ignore;
import { CountdownTimer } from '@/components/CountdownTimer';
export default function Payment(props) {
  const {
    $w
  } = props;
  const orderId = $w.page.dataset.params.orderId;
  const [order, setOrder] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('wechat');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [polling, setPolling] = useState(false);
  const {
    toast
  } = useToast();

  // 防抖处理
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [orderResult, profileResult] = await Promise.all([$w.cloud.callDataSource({
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
      setUserProfile(profileResult);
    } catch (error) {
      toast({
        title: "获取订单信息失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 支付倒计时完成
  const handleCountdownComplete = useCallback(() => {
    toast({
      title: "支付超时",
      description: "订单已超时，请重新下单",
      variant: "destructive"
    });
    setTimeout(() => {
      $w.utils.navigateTo({
        pageId: 'orderList'
      });
    }, 2000);
  }, []);

  // 支付轮询
  const pollPaymentStatus = useCallback(async () => {
    setPolling(true);
    const maxAttempts = 30;
    let attempts = 0;
    const poll = async () => {
      try {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'payment',
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
        });
        if (result && result.status === 'success') {
          setPaymentStatus('success');
          toast({
            title: "支付成功",
            description: "订单支付已完成",
            variant: "success"
          });
          setTimeout(() => {
            $w.utils.navigateTo({
              pageId: 'orderDetail',
              params: {
                orderId
              }
            });
          }, 2000);
          return true;
        }
        attempts++;
        if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          toast({
            title: "支付超时",
            description: "支付未完成，请重试",
            variant: "destructive"
          });
          return false;
        }
        return false;
      } catch (error) {
        console.error('轮询失败:', error);
        return false;
      }
    };
    const interval = setInterval(async () => {
      const completed = await poll();
      if (completed) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  // 防抖提交支付
  const debouncedSubmit = useCallback(debounce(async () => {
    if (submitting || polling) return;
    setSubmitting(true);
    try {
      // 模拟支付请求
      const paymentData = {
        orderId,
        amount: order.payAmount - pointsAmount / 100,
        method: selectedMethod,
        points: usePoints ? pointsAmount : 0,
        userId: $w.auth.currentUser?.userId || 'demo_user'
      };
      await $w.cloud.callDataSource({
        dataSourceName: 'payment',
        methodName: 'wedaCreateV2',
        params: {
          data: paymentData
        }
      });
      setPaymentStatus('processing');
      toast({
        title: "正在支付",
        description: "请稍候..."
      });
      // 开始轮询
      pollPaymentStatus();
    } catch (error) {
      toast({
        title: "支付失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }, 500), [orderId, order, selectedMethod, usePoints, pointsAmount, submitting, polling]);
  const handleSubmit = useCallback(() => {
    if (!order || submitting || polling) return;
    debouncedSubmit();
  }, [debouncedSubmit, order, submitting, polling]);
  const paymentMethods = [{
    type: 'wechat',
    name: '微信支付',
    description: '推荐使用微信支付'
  }, {
    type: 'balance',
    name: '余额支付',
    description: '使用账户余额支付'
  }, {
    type: 'points',
    name: '积分支付',
    description: '使用积分抵扣部分金额'
  }];
  const finalAmount = order ? order.payAmount - (usePoints ? pointsAmount / 100 : 0) : 0;
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
      <div className="p-4 space-y-4 pb-32">
        {/* 支付倒计时 */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-800">支付倒计时</h3>
              <p className="text-sm text-orange-600">请在15分钟内完成支付</p>
            </div>
            <CountdownTimer minutes={15} onComplete={handleCountdownComplete} />
          </CardContent>
        </Card>

        {/* 订单信息 */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">订单号</span>
                <span>{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">商品金额</span>
                <span>¥{order.totalAmount}</span>
              </div>
              {usePoints && <div className="flex justify-between text-green-600">
                  <span>积分抵扣</span>
                  <span>-¥{(pointsAmount / 100).toFixed(2)}</span>
                </div>}
              <div className="flex justify-between font-bold text-lg">
                <span>实付金额</span>
                <span className="text-red-600">¥{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 支付方式 */}
        <div className="space-y-3">
          <h3 className="font-semibold">选择支付方式</h3>
          {paymentMethods.map(method => <PaymentMethodCard key={method.type} method={method} isSelected={selectedMethod === method.type} onSelect={setSelectedMethod} balance={userProfile?.balance} points={userProfile?.points} />)}
        </div>

        {/* 积分抵扣 */}
        {userProfile && userProfile.points > 0 && <PointsDeduction points={userProfile.points} maxDeduction={order.payAmount * 0.3} usePoints={usePoints} onToggle={setUsePoints} onAmountChange={setPointsAmount} />}

        {/* 支付保障 */}
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">支付安全由微信支付保障</span>
          </CardContent>
        </Card>

        {/* 支付状态 */}
        {paymentStatus === 'success' && <Card className="bg-green-50">
            <CardContent className="p-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-semibold">支付成功，正在跳转...</span>
            </CardContent>
          </Card>}
        {paymentStatus === 'failed' && <Card className="bg-red-50">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-semibold">支付失败，请重试</span>
            </CardContent>
          </Card>}
      </div>

      {/* 支付按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">需支付</p>
            <p className="text-2xl font-bold text-red-600">¥{finalAmount.toFixed(2)}</p>
          </div>
          <Button className="h-12 px-8 text-base" onClick={handleSubmit} disabled={submitting || polling || paymentStatus !== 'pending'}>
            {submitting || polling ? <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                处理中...
              </div> : '立即支付'}
          </Button>
        </div>
      </div>
    </div>;
}