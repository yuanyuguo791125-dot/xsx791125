// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color
}) => {
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>;
};
const RecentOrders = ({
  orders
}) => {
  return <Card>
      <CardHeader>
        <CardTitle>最近订单</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map(order => <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{order.orderNo}</p>
                <p className="text-sm text-gray-500">{order.userName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">¥{order.totalAmount}</p>
                <Badge variant={order.status === 'paid' ? 'success' : 'secondary'}>
                  {order.status}
                </Badge>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
export default function AdminDashboard(props) {
  const {
    $w
  } = props;
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    todayRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDashboardData = async () => {
    try {
      const [products, orders, users] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          orderBy: [{
            createdAt: 'desc'
          }],
          limit: 5
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true
        }
      })]);
      setStats({
        totalProducts: products.total || 0,
        totalOrders: orders.total || 0,
        totalUsers: users.total || 0,
        todayRevenue: 0 // 需要计算今日收入
      });
      setRecentOrders(orders.records || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="商品总数" value={stats.totalProducts} icon={Package} color="bg-blue-500" trend="+12% from last month" />
          <StatCard title="订单总数" value={stats.totalOrders} icon={ShoppingCart} color="bg-green-500" trend="+8% from last month" />
          <StatCard title="用户总数" value={stats.totalUsers} icon={Users} color="bg-purple-500" trend="+5% from last month" />
          <StatCard title="今日收入" value={`¥${stats.todayRevenue}`} icon={DollarSign} color="bg-orange-500" trend="+20% from yesterday" />
        </div>

        {/* 管理模块 */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="orders">订单管理</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="content">内容管理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentOrders orders={recentOrders} />
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" onClick={() => $w.utils.navigateTo({
                    pageId: 'adminProductList'
                  })}>
                      <Package className="mr-2 h-4 w-4" />
                      商品列表
                    </Button>
                    <Button className="w-full justify-start" onClick={() => $w.utils.navigateTo({
                    pageId: 'adminOrderList'
                  })}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      订单列表
                    </Button>
                    <Button className="w-full justify-start" onClick={() => $w.utils.navigateTo({
                    pageId: 'adminBanner'
                  })}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      轮播图管理
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>商品管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">商品管理功能正在开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>订单管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">订单管理功能正在开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">用户管理功能正在开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>内容管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">内容管理功能正在开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}