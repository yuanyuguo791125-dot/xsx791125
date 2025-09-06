// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
// @ts-ignore;
import { Package, Truck, Clock, CheckCircle, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';

// 订单卡片组件
const OrderCard = ({
  order,
  onOrderClick
}) => {
  const getStatusInfo = status => {
    const statusMap = {
      '待付款': {
        color: 'warning',
        icon: Clock,
        text: '待付款'
      },
      '待发货': {
        color: 'info',
        icon: Package,
        text: '待发货'
      },
      '待收货': {
        color: 'processing',
        icon: Truck,
        text: '待收货'
      },
      '已完成': {
        color: 'success',
        icon: CheckCircle,
        text: '已完成'
      },
      '已取消': {
        color: 'destructive',
        icon: XCircle,
        text: '已取消'
      }
    };
    return statusMap[status] || {
      color: 'default',
      icon: Package,
      text: status
    };
  };
  const statusInfo = getStatusInfo(order.status);
  return <Card className="mb-4" onClick={() => onOrderClick(order._id)}>
      <CardContent className="p-4">
        {/* 订单头部 */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm font-medium">订单号: {order.orderId}</p>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <Badge variant={statusInfo.color} className="flex items-center gap-1">
            <statusInfo.icon className="w-3 h-3" />
            {statusInfo.text}
          </Badge>
        </div>

        {/* 商品信息 */}
        <div className="space-y-2 mb-3">
          {order.items?.slice(0, 2).map((item, index) => <div key={index} className="flex items-center gap-3">
              <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-16 h-16 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
              <p className="text-sm font-medium">¥{item.price}</p>
            </div>)}
          {order.items?.length > 2 && <p className="text-xs text-gray-500 text-center">+{order.items.length - 2} 件商品</p>}
        </div>

        {/* 订单金额 */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">共{order.items?.length || 0}件商品</span>
          <span className="text-lg font-bold">¥{order.totalAmount}</span>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={e => {
          e.stopPropagation();
          $w.utils.navigateTo({
            pageId: 'orderDetail',
            params: {
              orderId: order._id
            }
          });
        }}>
            查看详情
          </Button>
          {order.status === '待付款' && <Button size="sm" className="flex-1" onClick={e => {
          e.stopPropagation();
          $w.utils.navigateTo({
            pageId: 'payment',
            params: {
              orderId: order._id,
              totalAmount: order.totalAmount
            }
          });
        }}>
              立即付款
            </Button>}
          {order.status === '已完成' && <Button variant="outline" size="sm" className="flex-1" onClick={e => {
          e.stopPropagation();
          // 再次购买逻辑
          console.log('再次购买:', order._id);
        }}>
              再次购买
            </Button>}
        </div>
      </CardContent>
    </Card>;
};

// 空状态组件
const EmptyOrders = ({
  status
}) => {
  const statusText = {
    'all': '订单',
    '待付款': '待付款订单',
    '待发货': '待发货订单',
    '待收货': '待收货订单',
    '已完成': '已完成订单'
  };
  return <div className="flex flex-col items-center justify-center py-12">
      <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-gray-500 mb-2">暂无{statusText[status] || '订单'}</p>
      <p className="text-sm text-gray-400 mb-4">快去选购心仪的商品吧</p>
      <Button variant="outline" onClick={() => $w.utils.navigateTo({
      pageId: 'home'
    })}>
        去购物
      </Button>
    </div>;
};

// 订单数据Hook
const useOrderData = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const {
    toast
  } = useToast();
  const loadOrderData = async (status = 'all') => {
    try {
      setLoading(true);
      const userId = $w.auth.currentUser?.userId || 'guest';

      // 构建查询条件
      let filter = {
        user_id: {
          $eq: userId
        }
      };
      if (status !== 'all') {
        filter.status = {
          $eq: status
        };
      }

      // 从数据源获取订单数据
      const orderRes = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          select: {
            $master: true
          }
        }
      });
      setOrders(orderRes.records || []);
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
    orders,
    loading,
    activeTab,
    setActiveTab,
    loadOrderData
  };
};

// 订单状态标签
const OrderStatusTabs = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [{
    key: 'all',
    label: '全部'
  }, {
    key: '待付款',
    label: '待付款'
  }, {
    key: '待发货',
    label: '待发货'
  }, {
    key: '待收货',
    label: '待收货'
  }, {
    key: '已完成',
    label: '已完成'
  }];
  return <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-5">
        {tabs.map(tab => <TabsTrigger key={tab.key} value={tab.key} className="text-sm">
            {tab.label}
          </TabsTrigger>)}
      </TabsList>
    </Tabs>;
};
export default function OrderList(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('all');
  const {
    orders,
    loading,
    activeTab: currentTab,
    setActiveTab: setOrderActiveTab,
    loadOrderData
  } = useOrderData();
  useEffect(() => {
    loadOrderData(activeTab === 'all' ? 'all' : activeTab);
  }, [activeTab, loadOrderData]);
  const handleOrderClick = orderId => {
    $w.utils.navigateTo({
      pageId: 'orderDetail',
      params: {
        orderId
      }
    });
  };
  const filteredOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 border-b">
          <h1 className="text-lg font-bold text-center">我的订单</h1>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded mb-4" />)}
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-lg font-bold text-center">我的订单</h1>
      </div>

      {/* 状态标签 */}
      <div className="bg-white border-b">
        <OrderStatusTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 订单列表 */}
      <div className="p-4">
        {filteredOrders.length === 0 ? <EmptyOrders status={activeTab} /> : <div className="space-y-4">
            {filteredOrders.map(order => <OrderCard key={order._id} order={order} onOrderClick={handleOrderClick} />)}
          </div>}
      </div>

      {/* 底部导航 */}
      <TabBar activeTab="order" onTabChange={() => {}} />
    </div>;
}