// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Tabs, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { ShoppingBag, Users, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// @ts-ignore;

// 管理后台数据Hook
const useAdminData = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadAdminData = async () => {
    try {
      setLoading(true);

      // 获取统计数据
      const [productRes, orderRes, userRes] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      })]);

      // 获取收入统计
      const revenueRes = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $in: ['paid', 'shipped', 'completed']
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      const totalRevenue = revenueRes.records.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      setStats({
        totalProducts: productRes.total || 0,
        totalOrders: orderRes.total || 0,
        totalUsers: userRes.total || 0,
        totalRevenue
      });

      // 获取最近订单
      const recentOrdersRes = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10
        }
      });
      setRecentOrders(recentOrdersRes.records || []);
    } catch (error) {
      toast({
        title: '数据加载失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return {
    stats,
    recentOrders,
    loading,
    loadAdminData
  };
};

// 统计卡片组件
const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'blue'
}) => <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>;

// 销售趋势图表
const SalesChart = ({
  data
}) => <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold mb-4">销售趋势</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>;

// 订单状态饼图
const OrderStatusChart = ({
  data
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">订单状态分布</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>;
};

// 最近订单列表
const RecentOrdersList = ({
  orders
}) => <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold mb-4">最近订单</h3>
      <div className="space-y-3">
        {orders.map(order => <div key={order._id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">订单号: {order.orderId}</p>
              <p className="text-sm text-gray-600">金额: ¥{order.totalAmount}</p>
            </div>
            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>)}
      </div>
    </CardContent>
  </Card>;
export default function AdminDashboard(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('overview');
  const {
    stats,
    recentOrders,
    loading,
    loadAdminData
  } = useAdminData();
  const [salesData, setSalesData] = useState([{
    name: '周一',
    sales: 4000
  }, {
    name: '周二',
    sales: 3000
  }, {
    name: '周三',
    sales: 5000
  }, {
    name: '周四',
    sales: 2780
  }, {
    name: '周五',
    sales: 1890
  }, {
    name: '周六',
    sales: 2390
  }, {
    name: '周日',
    sales: 3490
  }]);
  const [orderStatusData, setOrderStatusData] = useState([{
    name: '待付款',
    value: 400
  }, {
    name: '待发货',
    value: 300
  }, {
    name: '已发货',
    value: 300
  }, {
    name: '已完成',
    value: 200
  }]);
  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);
  if (loading) {
    return <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>;
  }
  return <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">管理后台</h1>
        <p className="text-gray-600">欢迎使用电商管理后台</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="products">商品管理</TabsTrigger>
          <TabsTrigger value="orders">订单管理</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'overview' && <div className="space-y-6 mt-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="商品总数" value={stats.totalProducts} icon={Package} color="blue" />
            <StatCard title="订单总数" value={stats.totalOrders} icon={ShoppingBag} color="green" />
            <StatCard title="用户总数" value={stats.totalUsers} icon={Users} color="purple" />
            <StatCard title="总收入" value={`¥${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} color="orange" />
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart data={salesData} />
            <OrderStatusChart data={orderStatusData} />
          </div>

          {/* 最近订单 */}
          <RecentOrdersList orders={recentOrders} />
        </div>}

      {activeTab === 'products' && <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">商品管理</h2>
            <Button onClick={() => $w.utils.navigateTo({
          pageId: 'admin/productList'
        })}>
              管理商品
            </Button>
          </div>
        </div>}

      {activeTab === 'orders' && <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">订单管理</h2>
          <p className="text-gray-600">订单管理功能开发中...</p>
        </div>}

      {activeTab === 'users' && <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">用户管理</h2>
          <p className="text-gray-600">用户管理功能开发中...</p>
        </div>}
    </div>;
}