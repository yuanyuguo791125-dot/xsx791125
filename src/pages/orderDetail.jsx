// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Package, Truck, MapPin, Clock, RefreshCw, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
// @ts-ignore;
import { CountdownTimer } from '@/components/CountdownTimer';
const OrderInfo = memo(({
  order
}) => {
  return <Card>
      <CardHeader>
        <CardTitle>订单信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">订单号</span>
          <span>{order.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">下单时间</span>
          <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">支付方式</span>
          <span>{order.paymentMethod || '微信支付'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">订单状态</span>
          <Badge variant={order.status === '已完成' ? 'success' : order.status === '待发货' ? 'info' : 'warning'}>
            {order.status}
          </Badge>
        </div>
      </CardContent>
    </Card>;
});
const LogisticsInfo = memo(({
  logistics,
  onRefresh,
  lastUpdate
}) => {
  return <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>物流信息</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" />
            刷新
          </Button>
        </div>
        <p className="text-sm text-gray-500">最后更新：{lastUpdate}</p>
      </CardHeader>
      <CardContent>
        {logistics ? <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">{logistics.company}</p>
                <p className="text-sm text-gray-600">运单号：{logistics.trackingNo}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {logistics.traces?.map((trace, index) => <div key={index} className={`flex gap-3 ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm">{trace.description}</p>
                    <p className="text-xs text-gray-500">{new Date(trace.time).toLocaleString('zh-CN')}</p>
                  </div>
                </div>)}
            </div>
          </div> : <div className="text-center py-8">
          <Truck className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">暂无物流信息</p>
        </div>}
      </CardContent>
    </Card>;
});
const AddressInfo = memo(({
  address
}) => {
  return <Card>
      <CardHeader>
        <CardTitle>收货地址</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span>{address.name} {address.phone}</span>
          </div>
          <p className="text-sm text-gray-600">{address.address}</p>
        </div>
      </CardContent>
    </Card>;
});
export default function OrderDetail(props) {
  const {
    $w
  } = props;
  const orderId = $w.page.dataset.params.orderId;
  const [order, setOrder] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const {
    toast
  } = useToast();

  // 倒计时刷新
  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshLogistics();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const [orderResult, logisticsResult] = await Promise.all([$w.cloud.callDataSource({
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
        dataSourceName: 'logistics',
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
      })]);
      setOrder(orderResult);
      setLogistics(logisticsResult);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    } catch (error) {
      toast({
        title: "获取订单详情失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  const refreshLogistics = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'logistics',
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
      setLogistics(result);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    } catch (error) {
      toast({
        title: "刷新失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [orderId]);
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="orderDetail" />
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
  return <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">订单信息</TabsTrigger>
            <TabsTrigger value="logistics">物流信息</TabsTrigger>
            <TabsTrigger value="address">收货地址</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'info' && <div className="space-y-4">
            <OrderInfo order={order} />
            
            <Card>
              <CardHeader>
                <CardTitle>商品列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items?.map((item, index) => <div key={index} className="flex gap-3">
                      <LazyImage src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">¥{item.price} × {item.quantity}</p>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>}

        {activeTab === 'logistics' && <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                {countdown}秒后自动刷新
              </p>
              <Button variant="outline" size="sm" onClick={refreshLogistics} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                立即刷新
              </Button>
            </div>
            <LogisticsInfo logistics={logistics} onRefresh={refreshLogistics} lastUpdate={lastUpdate} />
          </div>}

        {activeTab === 'address' && <AddressInfo address={order.address} />}
      </div>
    </div>;
}