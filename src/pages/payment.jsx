
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  CreditCard, Wallet, Gift, Shield, ChevronRight, CheckCircle 
} from 'lucide-react';

export default function Payment(props) {
  const { $w } = props;
  const orderId = $w.page.dataset.params.orderId;
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('WECHAT');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      fetchOrderAndProfile();
    }
  }, [orderId]);

  const fetchOrderAndProfile = async () => {
    try {
      setLoading(true);
      
      // 获取订单信息
      const orderResult = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: { orderId: { $eq: orderId } }
          },
          select: { $master: true }
        }
      });
      
      if (orderResult) {
        setOrder(orderResult);
      }
      
      // 获取用户资料（包含余额和积分）
      const profileResult = await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: { userId: { $eq: $w.auth.currentUser?.userId || 'demo_user' } }
          },
          select: { $master: true }
        }
      });
      
      if (profileResult) {
        setUserProfile(profileResult);
      }
    } catch (error) {
      toast({
        title: "获取信息失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalAmount = () => {
    if (!order) return 0;
    let finalAmount = order.payAmount;
    
    if (usePoints && userProfile) {
      const maxPoints = Math.min(userProfile.points || 0, Math.floor(finalAmount * 100));
      const actualPoints = Math.min(pointsAmount, maxPoints);
      finalAmount = Math.max(0, finalAmount - (actualPoints / 100));
    }
    
    return finalAmount;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const finalAmount = calculateFinalAmount();
      const actualPoints = usePoints ? Math.min(pointsAmount, Math.floor(finalAmount * 100)) : 0;
      
      // 创建支付记录
      const paymentResult = await $w.cloud.callDataSource({
        dataSourceName: 'payment',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            orderId: orderId,
            userId: $w.auth.currentUser?.userId || 'demo_user',
            payMethod: paymentMethod,
            payAmount: finalAmount,
            pointsUsed: actualPoints,
            status: 'PENDING',
            createdAt: Date.now()
          }
        }
      });
      
      if (paymentResult) {
        // 模拟支付成功
        await $w.cloud.callDataSource({
          dataSourceName: 'payment',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              status: 'SUCCESS',
              completedAt: Date.now(),
              transactionId: `TXN${Date.now()}`
            },
            filter: {
              where: { paymentId: { $eq: paymentResult.id } }
            }
          }
        });
        
        // 更新订单状态
        await $w.cloud.callDataSource({
          dataSourceName: 'order',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              status: '待发货',
              paidAt: Date.now(),
              paymentMethod: paymentMethod
            },
            filter: {
              where: { orderId: { $eq: orderId } }
            }
          }
        });
        
        toast({
          title: "支付成功",
          description: "订单已支付，等待发货",
          variant: "success"
        });
        
        $w.utils.navigateTo({ pageId: 'orderDetail', params: { orderId } });
      }
    } catch (error) {
      toast({
        title: "支付失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">订单信息加载失败</p>
        </div>
      </div>
    );
  }

  const finalAmount = calculateFinalAmount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 订单信息 */}
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-base">订单信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">订单编号</span>
            <span>{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">商品金额</span>
            <span>¥{order.totalAmount}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">优惠金额</span>
              <span className="text-green-600">-¥{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>应付金额</span>
            <span className="text-red-600">¥{order.payAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* 支付方式选择 */}
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-base">选择支付方式</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              <Label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">微信支付</p>
                    <p className="text-sm text-gray-600">推荐使用，安全快捷</p>
                  </div>
                </div>
                <RadioGroupItem value="WECHAT" />
              </Label>
              
              <Label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">余额支付</p>
                    <p className="text-sm text-gray-600">
                      可用余额 ¥{userProfile?.balance || 0}
                    </p>
                  </div>
                </div>
                <RadioGroupItem value="BALANCE" />
              </Label>
              
              <Label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">积分抵扣</p>
                    <p className="text-sm text-gray-600">
                      可用积分 {userProfile?.points || 0}
                    </p>
                  </div>
                </div>
                <RadioGroupItem value="POINTS" />
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 积分抵扣 */}
      {paymentMethod === 'POINTS' && userProfile && (
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>积分抵扣</span>
              <Switch 
                checked={usePoints}