// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Package, Truck, CreditCard, Clock, MapPin } from 'lucide-react';

export default function OrderDetail(props) {
  const {
    $w
  } = props;
  const orderId = $w.page.dataset.params.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);
  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await $w.cloud.callDataSource({
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
      setOrder(res);
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
  if (loading) {
    return <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>;
  }
  if (!order) {
    return <div className="p-4 text-center">
        <p className="text-gray-500">订单不存在</p>
      </div>;
  }
  return <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">订单详情</h1>
        <p className="text-sm text-gray-600">订单号: {order.orderId}</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">订单状态</span>
            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            商品信息
          </h3>
          {order.items?.map((item, index) => <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
              <span>{item.name}</span>
              <span>¥{item.price} x {item.quantity}</span>
            </div>)}
          <div className="flex justify-between font-bold mt-2">
            <span>总计</span>
            <span>¥{order.totalAmount}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            收货地址
          </h3>
          <p className="text-sm text-gray-600">{order.address}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            订单时间
          </h3>
          <p className="text-sm text-gray-600">创建时间: {new Date(order.createdAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>;
}