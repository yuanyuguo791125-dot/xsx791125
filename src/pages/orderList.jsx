// @ts-ignore;
import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Tabs, TabsList, TabsTrigger, Badge } from '@/components/ui';
// @ts-ignore;
import { RefreshCw, AlertCircle, Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';

// @ts-ignore;
import { OrderCard } from '@/components/OrderCard';

// 订单状态配置
const ORDER_STATUS_CONFIG = {
  all: {
    label: '全部',
    color: 'default',
    icon: Package
  },
  pending: {
    label: '待付款',
    color: 'warning',
    icon: Clock
  },
  paid: {
    label: '待发货',
    color: 'info',
    icon: Package
  },
  shipped: {
    label: '待收货',
    color: 'primary',
    icon: Truck
  },
  completed: {
    label: '已完成',
    color: 'success',
    icon: CheckCircle
  },
  cancelled: {
    label: '已取消',
    color: 'destructive',
    icon: XCircle
  }
};

// 数据加载Hook
const useOrders = status => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const {
    toast
  } = useToast();
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = isRefresh ? 1 : page;
      const filter = {
        where: {
          userId: {
            $eq: $w.auth.currentUser?.userId || 'demo_user'
          }
        }
      };

      // 状态筛选
      if (status !== 'all') {
        filter.where.status = {
          $eq: status
        };
      }
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter,
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageNumber: currentPage,
          pageSize: 10,
          getCount: true
        }
      });

      // 安全处理返回数据
      const orders = (res.records || []).map(order => ({
        _id: order._id,
        orderNo: order.orderNo || `ORDER-${Date.now()}`,
        status: order.status || 'pending',
        createdAt: order.createdAt || new Date().toISOString(),
        totalAmount: order.totalAmount || 0,
        items: Array.isArray(order.items) ? order.items.map(item => ({
          name: item.name || '商品名称',
          image: item.image || '',
          quantity: item.quantity || 1,
          price: item.price || 0
        })) : []
      }));
      if (isRefresh) {
        setData(orders);
      } else {
        setData(prev => [...prev, ...orders]);
      }
      setTotal(res.total || 0);
      setHasMore(orders.length === 10 && currentPage * 10 < res.total);
      setPage(currentPage + 1);
    } catch (err) {
      setError(err.message);
      toast({
        title: '加载失败',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [page, status]);
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadData(true);
  }, [loadData]);
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData();
    }
  }, [loading, hasMore, loadData]);
  return {
    data,
    loading,
    error,
    hasMore,
    total,
    refresh,
    loadMore
  };
};

// 骨架屏组件
const OrderListSkeleton = () => <div className="space-y-4 p-4">
    {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex gap-3 mb-3">
            <div className="w-20 h-20 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </CardContent>
      </Card>)}
  </div>;

// 错误状态组件
const ErrorState = ({
  message,
  onRetry
}) => <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
    <p className="text-gray-500 mb-4">{message}</p>
    <Button variant="outline" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      重新加载
    </Button>
  </div>;

// 空状态组件
const EmptyState = ({
  title,
  description
}) => <div className="text-center py-12">
    <Package className="w-12 h-12 text-gray-400 mb-4" />
    <p className="text-gray-500">{title}</p>
    <p className="text-sm text-gray-400 mt-2">{description}</p>
  </div>;

// 统计卡片
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color
}) => <Card className="flex-1">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>;
export default function OrderList(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // 使用自定义Hook加载订单数据
  const orders = useOrders(activeTab);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await orders.refresh();
    setRefreshing(false);
  }, [orders]);

  // 无限滚动
  const observerRef = useRef();
  const lastOrderRef = useCallback(node => {
    if (orders.loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && orders.hasMore) {
        orders.loadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [orders.loading, orders.hasMore, orders.loadMore]);

  // 页面加载
  useEffect(() => {
    handleRefresh();
  }, [activeTab]);

  // 渲染订单列表
  const renderOrders = () => {
    if (orders.loading && orders.data.length === 0) {
      return <OrderListSkeleton />;
    }
    if (orders.error) {
      return <ErrorState message={orders.error} onRetry={orders.refresh} />;
    }
    if (orders.data.length === 0) {
      const statusText = ORDER_STATUS_CONFIG[activeTab]?.label || '订单';
      return <EmptyState title={`暂无${statusText}`} description="购物后订单将显示在这里" />;
    }
    return <div className="space-y-4">
        {orders.data.map((order, index) => <OrderCard key={order._id} order={order} onClick={() => $w.utils.navigateTo({
        pageId: 'orderDetail',
        params: {
          orderId: order._id
        }
      })} ref={index === orders.data.length - 1 ? lastOrderRef : null} />)}
      </div>;
  };

  // 渲染统计信息
  const renderStats = () => {
    const stats = [{
      title: '全部订单',
      value: orders.total,
      icon: Package,
      color: 'bg-blue-500'
    }, {
      title: '待付款',
      value: orders.data.filter(o => o.status === 'pending').length,
      icon: Clock,
      color: 'bg-orange-500'
    }, {
      title: '待收货',
      value: orders.data.filter(o => o.status === 'shipped').length,
      icon: Truck,
      color: 'bg-green-500'
    }, {
      title: '已完成',
      value: orders.data.filter(o => o.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-purple-500'
    }];
    return <div className="flex gap-4 p-4">
        {stats.map(stat => <StatsCard key={stat.title} {...stat} />)}
      </div>;
  };
  return <div className="min-h-screen bg-gray-50">
      {/* 下拉刷新指示器 */}
      {refreshing && <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2">
          正在刷新...
        </div>}

      {/* 统计信息 */}
      {renderStats()}

      {/* 状态筛选 */}
      <div className="bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => <TabsTrigger key={key} value={key} className="text-sm">
                {config.label}
              </TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {/* 订单列表 */}
      <div className="p-4">
        {renderOrders()}

        {/* 加载更多 */}
        {orders.hasMore && !orders.loading && <div className="text-center py-4">
            <Button variant="outline" onClick={orders.loadMore}>
              加载更多
            </Button>
          </div>}

        {/* 底部提示 */}
        {!orders.hasMore && orders.data.length > 0 && <div className="text-center py-4">
            <p className="text-sm text-gray-500">已加载全部订单</p>
          </div>}
      </div>
    </div>;
}