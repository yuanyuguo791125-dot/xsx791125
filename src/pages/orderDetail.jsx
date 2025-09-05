// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Clock, Package, Truck, CheckCircle, MapPin, CreditCard, ChevronRight, Phone, MessageCircle, Shield } from 'lucide-react';

export default function OrderDetail(props) {
  const {
    $w
  } = props;
  const orderId = $w.page.dataset.params.orderId;
  const [order, setOrder] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);
  useEffect(() => {
    if (order?.status === '待付款' && order.createdAt) {
      const timer = setInterval(() => {
        const expiry = new Date(order.createdAt).getTime() + 30 * 60 * 1000; // 30分钟
        const now = new Date().getTime();
        const remaining = expiry - now;
        if (remaining > 0) {
          setCountdown({
            minutes: Math.floor(remaining / 60000),
            seconds: Math.floor(remaining % 60000 / 1000)
          });
        } else {
          setCountdown(null);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [order]);
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);

      // 获取订单详情
      const orderResult = await $w.cloud.callDataSource({
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
      });
      if (orderResult) {
        setOrder(orderResult);

        // 获取物流信息
        if (orderResult.trackingNo) {
          const logisticsResult = await $w.cloud.callDataSource({
            dataSourceName: 'logistics',
            methodName: 'wedaGetItemV2',
            params: {
              filter: {
                where: {
                  trackingNo: {
                    $eq: orderResult.trackingNo
                  }
                }
              },
              select: {
                $master: true
              }
            }
          });
          setLogistics(logisticsResult);
        }
      }
    } catch (error) {
      toast({
        title: "获取订单详情失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getStatusConfig = status => {
    const configs = {
      '待付款': {
        color: 'warning',
        icon: Clock,
        label: '待付款'
      },
      '待发货': {
        color: 'info',
        icon: Package,
        label: '待发货'
      },
      '待收货': {
        color: 'primary',
        icon: Truck,
        label: '待收货'
      },
      '已完成': {
        color: 'success',
        icon: CheckCircle,
        label: '已完成'
      },
      '已取消': {
        color: 'destructive',
        icon: 'XCircle',
        label: '已取消'
      }
    };
    return configs[status] || configs['待付款'];
  };
  const formatDate = timestamp => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  if (!order) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">订单不存在</p>
        </div>
      </div>;
  }
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  return <div className="min-h-screen bg-gray-50">
      {/* 订单状态卡片 */}
      <Card className="m-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 text-${statusConfig.color}`} />
              <span className="font-semibold">{statusConfig.label}</span>
            </div>
            {countdown && <div className="text-sm text-orange-600">
                剩余支付时间：{countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')}
              </div>}
          </div>
          
          {/* 物流时间轴 */}
          {logistics?.timeline && order.status !== '待付款' && <div className="mt-4">
              <div className="relative pl-4 border-l-2 border-gray-200">
                {logistics.timeline.map((item, index) => <div key={index} className="relative mb-4">
                    <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white 
                      ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="ml-4">
                      <p className={`text-sm ${index === 0 ? 'font-semibold' : ''}`}>
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">{item.location}</p>
                      <p className="text-xs text-gray-400">{formatDate(item.time)}</p>
                    </div>
                  </div>)}
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* 收货地址 */}
      <Card className="m-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            收货地址
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="font-medium">{order.address?.name} {order.address?.phone}</p>
            <p className="text-sm text-gray-600">{order.address?.detail}</p>
          </div>
        </CardContent>
      </Card>

      {/* 商品清单 */}
      <Card className="m-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">商品清单</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {order.items?.map((item, index) => <div key={index} className="flex gap-3 p-4 border-b last:border-b-0">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.specifications}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">¥{item.price}</span>
                  <span className="text-sm">×{item.quantity}</span>
                </div>
              </div>
            </div>)}
        </CardContent>
      </Card>

      {/* 订单信息 */}
      <Card className="m-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">订单信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">订单编号</span>
            <span>{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">下单时间</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">支付方式</span>
            <span>{order.paymentMethod || '未支付'}</span>
          </div>
          {order.remark && <div className="flex justify-between">
              <span className="text-gray-600">订单备注</span>
              <span>{order.remark}</span>
            </div>}
        </CardContent>
      </Card>

      {/* 金额汇总 */}
      <Card className="m-4">
        <CardContent className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <span>商品金额</span>
            <span>¥{order.totalAmount}</span>
          </div>
          {order.discountAmount > 0 && <div className="flex justify-between text-sm">
              <span>优惠金额</span>
              <span className="text-green-600">-¥{order.discountAmount}</span>
            </div>}
          {order.pointsUsed > 0 && <div className="flex justify-between text-sm">
              <span>积分抵扣</span>
              <span className="text-green-600">-¥{order.pointsUsed / 100}</span>
            </div>}
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>实付金额</span>
            <span className="text-red-600">¥{order.payAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="m-4 space-y-2">
        {order.status === '待付款' && <>
            <Button className="w-full" onClick={() => $w.utils.navigateTo({
          pageId: 'payment',
          params: {
            orderId: order.orderId
          }
        })}>
              立即支付
            </Button>
            <Button variant="outline" className="w-full">
              取消订单
            </Button>
          </>}
        
        {order.status === '待收货' && <>
            <Button className="w-full">确认收货</Button>
            <Button variant="outline" className="w-full">
              查看物流
            </Button>
          </>}
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            联系客服
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            申请售后
          </Button>
        </div>
      </div>
    </div>;
}