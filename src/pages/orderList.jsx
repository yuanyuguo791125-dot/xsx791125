// @ts-ignore;
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button, Tabs, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Package, Clock, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
// @ts-ignore;
import { VirtualizedList } from '@/components/VirtualizedList';
const OrderCard = memo(({
  order,
  onAction
}) => {
  const getStatusConfig = status => {
    const configs = {
      '待付款': {
        color: 'warning',
        icon: Clock,
        label: '待付款',
        action: 'pay'
      },
      '待发货': {
        color: 'info',
        icon: Package,
        label: '待发货',
        action: 'remind'
      },
      '待收货': {
        color: 'primary',
        icon: Truck,
        label: '待收货',
        action: 'confirm'
      },
      '已完成': {
        color: 'success',
        icon: CheckCircle,
        label: '已完成',
        action: 'review'
      },
      '已取消': {
        color: 'destructive',
        icon: XCircle,
        label: '已取消',
        action: 'delete'
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
              <LazyImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" loading="lazy" />
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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {
    toast
  } = useToast();
  const observerRef = useRef(null);
  const lastOrderRef = useRef(null);

  // 防抖刷新
  const debounceRefresh = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }, []);
  const fetchOrders = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(pageNum === 1);
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'demo_user'
              },
              ...(activeTab !== 'all' && {
                status: {
                  $eq: activeTab
                }
              })
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
      const newOrders = result.records || [];
      if (pageNum === 1) {
        setOrders(newOrders);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }
      setHasMore(newOrders.length === 10);
      setPage(pageNum);
    } catch (error) {
      toast({
        title: "获取订单失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    debounceRefresh(() => {
      setPage(1);
      fetchOrders(1, true);
    }, 300)();
  }, [fetchOrders, debounceRefresh]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      fetchOrders(page + 1);
    }
  }, [hasMore, loading, refreshing, page, fetchOrders]);

  // 虚拟滚动优化
  const handleScroll = useCallback(entries => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      handleLoadMore();
    }
  }, [hasMore, loading, handleLoadMore]);
  useEffect(() => {
    const observer = new IntersectionObserver(handleScroll, {
      threshold: 0.1
    });
    if (lastOrderRef.current) {
      observer.observe(lastOrderRef.current);
    }
    return () => {
      if (lastOrderRef.current) {
        observer.unobserve(lastOrderRef.current);
      }
    };
  }, [handleScroll]);
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchOrders(1);
  }, [activeTab, fetchOrders]);
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
      confirm: async () => {
        try {
          await $w.cloud.callDataSource({
            dataSourceName: 'order',
            methodName: 'wedaUpdateV2',
            params: {
              data: {
                status: '已完成'
              },
              filter: {
                where: {
                  orderId: {
                    $eq: order.orderId
                  }
                }
              }
            }
          });
          toast({
            title: "确认收货成功",
            description: "订单已完成"
          });
          handleRefresh();
        } catch (error) {
          toast({
            title: "操作失败",
            description: error.message,
            variant: "destructive"
          });
        }
      },
      track: () => $w.utils.navigateTo({
        pageId: 'orderDetail',
        params: {
          orderId: order.orderId,
          tab: 'logistics'
        }
      }),
      review: () => $w.utils.navigateTo({
        pageId: 'review',
        params: {
          orderId: order.orderId
        }
      }),
      delete: async () => {
        try {
          await $w.cloud.callDataSource({
            dataSourceName: 'order',
            methodName: 'wedaDeleteV2',
            params: {
              filter: {
                where: {
                  orderId: {
                    $eq: order.orderId
                  }
                }
              }
            }
          });
          toast({
            title: "删除成功",
            description: "订单已删除"
          });
          handleRefresh();
        } catch (error) {
          toast({
            title: "删除失败",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    };
    actions[action]?.();
  }, [handleRefresh]);
  const statusTabs = [{
    value: 'all',
    label: '全部'
  }, {
    value: '待付款',
    label: '待付款'
  }, {
    value: '待发货',
    label: '待发货'
  }, {
    value: '待收货',
    label: '待收货'
  }, {
    value: '已完成',
    label: '已完成'
  }];
  if (loading && orders.length === 0) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="orderList" />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white z-10 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {statusTabs.map(tab => <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        {refreshing && <div className="flex justify-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          </div>}
        
        <VirtualizedList items={orders} renderItem={order => <OrderCard order={order} onAction={handleAction} />} onLoadMore={handleLoadMore} hasMore={hasMore} loading={loading} />
        
        {orders.length === 0 && !loading && <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">暂无订单</p>
          </div>}
        
        <div ref={lastOrderRef} className="h-4" />
      </div>
    </div>;
}