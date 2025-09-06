// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, RadioGroup, RadioGroupItem, Label } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Wallet, ShieldCheck, ShoppingBag, MapPin, User, Phone, ChevronRight } from 'lucide-react';

// @ts-ignore;
import PaymentMethodCard from '@/components/PaymentMethodCard';
// @ts-ignore;
import PointsDeduction from '@/components/PointsDeduction';

// 支付数据Hook
const usePaymentData = () => {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadPaymentData = async (orderId, itemsData) => {
    try {
      setLoading(true);
      if (orderId) {
        // 从订单数据源获取订单详情
        const orderRes = await $w.cloud.callDataSource({
          dataSourceName: 'order',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: orderId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        setOrder(orderRes);
        setItems(orderRes.items || []);
      } else if (itemsData) {
        // 从购物车直接结算
        setItems(itemsData);
      }

      // 获取用户地址
      const userId = $w.auth.currentUser?.userId || 'guest';
      const addressRes = await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setAddress(addressRes?.address || null);

      // 获取支付方式
      const paymentRes = await $w.cloud.callDataSource({
        dataSourceName: 'payment',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setPaymentMethods(paymentRes.records || []);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return {
    order,
    items,
    address,
    paymentMethods,
    loading,
    loadPaymentData
  };
};

// 地址卡片组件
const AddressCard = ({
  address
}) => {
  if (!address) {
    return <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">请添加收货地址</span>
            </div>
            <Button variant="outline" size="sm">添加地址</Button>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{address.name}</span>
              <Phone className="w-4 h-4 text-gray-400 ml-2" />
              <span className="text-sm text-gray-600">{address.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">
                {address.province} {address.city} {address.district} {address.detail}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>;
};

// 商品列表组件
const OrderItemsList = ({
  items
}) => {
  return <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">商品信息</h3>
        <div className="space-y-3">
          {items.map((item, index) => <div key={index} className="flex items-center gap-3">
              <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-16 h-16 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                {item.specifications && <p className="text-xs text-gray-500">{item.specifications}</p>}
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">¥{item.price}</p>
                {item.original_price && item.original_price > item.price && <p className="text-xs text-gray-400 line-through">¥{item.original_price}</p>}
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};

// 订单金额组件
const OrderSummary = ({
  items,
  pointsDeduction = 0
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 99 ? 0 : 10;
  const total = subtotal - pointsDeduction + shipping;
  return <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">订单金额</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>商品金额</span>
            <span>¥{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>运费</span>
            <span>{shipping === 0 ? '免运费' : `¥${shipping.toFixed(2)}`}</span>
          </div>
          {pointsDeduction > 0 && <div className="flex justify-between text-sm text-green-600">
              <span>积分抵扣</span>
              <span>-¥{pointsDeduction.toFixed(2)}</span>
            </div>}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>实付款</span>
            <span className="text-red-500">¥{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default function Payment(props) {
  const {
    $w
  } = props;
  const [selectedPayment, setSelectedPayment] = useState('wechat');
  const [pointsDeduction, setPointsDeduction] = useState(0);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const orderId = $w.page.dataset.params.orderId;
  const itemsData = $w.page.dataset.params.items;
  const totalAmount = parseFloat($w.page.dataset.params.totalAmount || 0);
  const {
    order,
    items,
    address,
    paymentMethods,
    loading: dataLoading
  } = usePaymentData();
  useEffect(() => {
    loadPaymentData(orderId, itemsData);
  }, [orderId, itemsData]);
  const handlePayment = async () => {
    if (!address) {
      toast({
        title: '请添加收货地址',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // 调用云函数创建订单
      const result = await $w.cloud.callFunction({
        name: 'createOrder',
        data: {
          items: items || itemsData,
          totalAmount: totalAmount - pointsDeduction,
          address: address,
          paymentMethod: selectedPayment,
          userId: $w.auth.currentUser?.userId || 'guest'
        }
      });
      if (result.success) {
        toast({
          title: '支付成功',
          description: '订单已创建，正在跳转...'
        });

        // 跳转到订单详情页
        setTimeout(() => {
          $w.utils.navigateTo({
            pageId: 'orderDetail',
            params: {
              orderId: result.orderId
            }
          });
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: '支付失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  if (dataLoading) {
    return <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 border-b">
          <h1 className="text-lg font-bold text-center">确认订单</h1>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4" />
            <div className="h-32 bg-gray-200 rounded mb-4" />
            <div className="h-40 bg-gray-200 rounded mb-4" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-lg font-bold text-center">确认订单</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 收货地址 */}
        <AddressCard address={address} />

        {/* 商品列表 */}
        <OrderItemsList items={items || itemsData} />

        {/* 积分抵扣 */}
        <PointsDeduction onDeductionChange={setPointsDeduction} maxDeduction={Math.min(totalAmount * 0.1, 100)} />

        {/* 订单金额 */}
        <OrderSummary items={items || itemsData} pointsDeduction={pointsDeduction} />

        {/* 支付方式 */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">支付方式</h3>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="wechat" id="wechat" />
                  <Label htmlFor="wechat" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="w-5 h-5 text-green-600" />
                    <span>微信支付</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="alipay" id="alipay" />
                  <Label htmlFor="alipay" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>支付宝</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 服务保障 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4" />
              <span>支付安全保障，请放心支付</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部结算栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">实付款</p>
            <p className="text-xl font-bold text-red-500">
              ¥{(totalAmount - pointsDeduction).toFixed(2)}
            </p>
          </div>
          <Button className="w-48" onClick={handlePayment} disabled={loading || !address}>
            {loading ? '处理中...' : '立即支付'}
          </Button>
        </div>
      </div>
    </div>;
}