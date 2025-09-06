// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, AlertTriangle } from 'lucide-react';

// @ts-ignore;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// 仪表盘数据Hook
const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    todaySales: 0,
    todayOrders: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 获取订单统计
      const orderRes = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });

      // 获取商品统计
      const productRes = await $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });

      // 获取用户统计
      const userRes = await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });

      // 计算统计数据
      const totalSales = orderRes.records?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
      const todaySales = orderRes.records?.filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString()).reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
      const todayOrders = orderRes.records?.filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString()).length || 0;
      setStats({
        totalSales,
        totalOrders: orderRes.total || 0,
        totalProducts: productRes.total || 0,
        totalUsers: userRes.total || 0,
        todaySales,
        todayOrders
      });

      // 生成销售数据图表
      const salesChartData = Array.from({
        length: 7
      }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayOrders = orderRes.records?.filter(order => new Date(order.createdAt).toDateString() === date.toDateString()) || [];
        return {
          date: date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
          }),
          sales: dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
          orders: dayOrders.length
        };
      });
      setSalesData(salesChartData);

      // 获取商品分类数据
      const categoryRes = await $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          }
        }
      });

      // 获取最近订单
      const recentOrderRes = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 5,
          select: {
            $master: true
          }
        }
      });
      setRecentOrders(recentOrderRes.records || []);
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
    stats,
    salesData,
    productData,
    recentOrders,
    loading,
    loadDashboardData
  };
};

// 统计卡片组件
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color
}) => <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>;

// 图表颜色配置
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
export default function AdminDashboard(props) {
  const {
    $w
  } = props;
  const {
    stats,
    salesData,
    productData,
    recentOrders,
    loading,
    loadDashboardData
  } = useDashboardData();
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-600">欢迎回来，管理员</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="总销售额" value={`¥${stats.totalSales.toLocaleString()}`} icon={DollarSign} color="bg-blue-500" />
        <StatCard title="总订单数" value={stats.totalOrders} icon={ShoppingBag} color="bg-green-500" />
        <StatCard title="商品总数" value={stats.totalProducts} icon={Package} color="bg-yellow-500" />
        <StatCard title="用户总数" value={stats.totalUsers} icon={Users} color="bg-purple-500" />
      </div>

      {/* 今日数据 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">今日数据</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">今日销售额</span>
                <span className="font-bold">¥{stats.todaySales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">今日订单数</span>
                <span className="font-bold">{stats.todayOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">系统状态</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">系统运行正常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">数据库连接正常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm">3个待处理订单</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 销售趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">销售趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">商品分类占比</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={productData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {productData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 最近订单 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">最近订单</h3>
            <Button variant="outline" size="sm" onClick={() => $w.utils.navigateTo({
            pageId: 'admin/productList'
          })}>
              查看全部
            </Button>
          </div>
          <div className="space-y-4">
            {recentOrders.map(order => <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">订单 #{order.orderId}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">¥{order.totalAmount}</p>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}