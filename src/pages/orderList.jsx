// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button, Tabs, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

// @ts-ignore;
import { VirtualizedList } from '@/components/VirtualizedList';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
const OrderCard = memo(({
  order,
  onAction
}) => {
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
        icon: XCircle,
        label: '已取消'
      }
    };
    return configs[status] || configs['待付款'];
  };
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  return <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">订单号：{order.orderId}</span>
          <Badge variant={statusConfig.color} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {order.items?.map((item, index) => <div key={index} className="flex gap-3">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" loading="lazy" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-sm text-gray-600">¥{item.price} × {item.quantity}</p>
              </div>
            </div>)}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </span>
            <span className="font-semibold">实付：¥{order.payAmount}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAction(order, 'detail')}>
              查看详情
            </Button>
            {order.status === '待付款' && <Button size="sm" onClick={() => onAction(order, 'pay')}>去支付</Button>}
            {order.status === '待收货' && <Button size="sm" onClick={() => onAction(order, 'confirm')}>确认收货</Button>}
            {order.trackingNo && <Button variant="outline" size="sm" onClick={() => onAction(order, 'track')}>查看物流</Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
});
export default function OrderList(props) {
  const {
    $w
  } = props;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {
    toast
  } = useToast();
  const fetchOrders = useCallback(async (pageNum = 1) => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'demo_user'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          pageNumber: pageNum,
          select: {
            $master: true
          }
        }
      });
      if (result.records) {
        const filteredOrders = activeTab === 'all' ? result.records : result.records.filter(order => {
          switch (activeTab) {
            case 'pending':
              return order.status === '待付款';
            case 'processing':
              return order.status === '待发货';
            case 'shipping':
              return order.status === '待收货';
            case 'completed':
              return order.status === '已完成';
            default:
              return true;
          }
        });
        if (pageNum === 1) {
          setOrders(filteredOrders);
        } else {
          setOrders(prev => [...prev, ...filteredOrders]);
        }
        setHasMore(result.records.length === 10);
      }
    } catch (error) {
      toast({
        title: "获取订单失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchOrders(1);
  }, [activeTab, fetchOrders]);
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage);
    }
  }, [hasMore, loading, page, fetchOrders]);
  const handleAction = useCallback((order, action) => {
    const actions = {
      detail: () => $w.utils.navigateTo({
        pageId: 'orderDetail',
        params: {
          orderId: order.orderId
        }
      }),
      pay: () => $w.utils.navigateTo({
        pageId: 'payment',
        params: {
          orderId: order.orderId
        }
      }),
      confirm: () => {
        // 确认收货逻辑
      },
      track: () => $w.utils.navigateTo({
        pageId: 'logistics',
        params: {
          trackingNo: order.trackingNo
        }
      })
    };
    actions[action]?.();
  }, []);
  if (loading && orders.length === 0) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="orderList" />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white z-10 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="pending">待付款</TabsTrigger>
            <TabsTrigger value="processing">待发货</TabsTrigger>
            <TabsTrigger value="shipping">待收货</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        <VirtualizedList items={orders} renderItem={order => <OrderCard order={order} onAction={handleAction} />} onLoadMore={handleLoadMore} hasMore={hasMore} loading={loading} />
      </div>
    </div>;
}