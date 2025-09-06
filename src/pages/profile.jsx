// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
// @ts-ignore;
import { User, Settings, ShoppingBag, Heart, MapPin, CreditCard, Gift, MessageCircle, LogOut, ChevronRight, Star, TrendingUp, Package, Truck } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';

// 个人中心数据Hook
const useProfileData = () => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [stats, setStats] = useState({
    orders: 0,
    coupons: 0,
    favorites: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userId = $w.auth.currentUser?.userId || 'guest';

      // 获取用户信息
      const userRes = await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setUser(userRes);

      // 获取积分历史
      const pointsRes = await $w.cloud.callDataSource({
        dataSourceName: 'points_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 5,
          select: {
            $master: true
          }
        }
      });
      setPointsHistory(pointsRes.records || []);

      // 计算积分余额
      const totalPoints = pointsRes.records?.reduce((sum, record) => {
        return sum + (record.type === 'earn' ? record.points : -record.points);
      }, 0) || 0;
      setPoints(totalPoints);

      // 获取订单统计
      const orderRes = await $w.cloud.callDataSource({
        dataSourceName: 'order',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          getCount: true,
          select: {
            $master: true
          }
        }
      });
      setStats({
        orders: orderRes.total || 0,
        coupons: userRes?.coupons?.length || 0,
        favorites: userRes?.favorites?.length || 0
      });
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
    user,
    points,
    pointsHistory,
    stats,
    loading,
    loadProfileData
  };
};

// 用户头像组件
const UserAvatar = ({
  user
}) => {
  if (!user) return null;
  return <div className="flex items-center gap-4">
      <Avatar className="w-16 h-16">
        <AvatarImage src={user.avatar || '/avatar-placeholder.jpg'} />
        <AvatarFallback className="bg-blue-500 text-white">
          {user.name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-xl font-bold text-white">{user.name || '用户'}</h2>
        <p className="text-sm text-white/80">{user.phone || '未绑定手机号'}</p>
      </div>
    </div>;
};

// 会员等级组件
const MemberLevel = ({
  level,
  points
}) => {
  const levelConfig = {
    1: {
      name: '普通会员',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Star
    },
    2: {
      name: '银卡会员',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: Star
    },
    3: {
      name: '金卡会员',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: Star
    },
    4: {
      name: '钻石会员',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: Star
    }
  };
  const config = levelConfig[level] || levelConfig[1];
  return <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <config.icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <span className={`font-medium ${config.color}`}>{config.name}</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">当前积分</p>
            <p className="text-lg font-bold text-blue-600">{points}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{
            width: `${Math.min(points / 1000 * 100, 100)}%`
          }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            再积{Math.max(0, 1000 - points)}分升级
          </p>
        </div>
      </CardContent>
    </Card>;
};

// 用户统计卡片
const UserStats = ({
  stats
}) => {
  const statItems = [{
    label: '我的订单',
    value: stats.orders,
    icon: ShoppingBag,
    path: 'orderList'
  }, {
    label: '优惠券',
    value: stats.coupons,
    icon: Gift,
    path: 'coupons'
  }, {
    label: '收藏夹',
    value: stats.favorites,
    icon: Heart,
    path: 'favorites'
  }];
  return <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {statItems.map((item, index) => <div key={index} className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2" onClick={() => $w.utils.navigateTo({
          pageId: item.path
        })}>
              <div className="flex justify-center mb-1">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};

// 菜单项组件
const MenuItem = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  badge,
  showArrow = true
}) => <div className="flex items-center justify-between p-4 bg-white border-b cursor-pointer hover:bg-gray-50" onClick={onClick}>
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-600" />
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {badge && <Badge variant="secondary">{badge}</Badge>}
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  </div>;

// 订单状态卡片
const OrderStatusCard = ({
  stats
}) => {
  const statusItems = [{
    label: '待付款',
    value: 0,
    icon: Clock,
    color: 'text-orange-500'
  }, {
    label: '待发货',
    value: 0,
    icon: Package,
    color: 'text-blue-500'
  }, {
    label: '待收货',
    value: 0,
    icon: Truck,
    color: 'text-green-500'
  }, {
    label: '待评价',
    value: 0,
    icon: MessageCircle,
    color: 'text-purple-500'
  }];
  return <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {statusItems.map((item, index) => <div key={index} className="text-center cursor-pointer" onClick={() => $w.utils.navigateTo({
          pageId: 'orderList',
          params: {
            status: item.label
          }
        })}>
              <div className={`flex justify-center mb-1 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
export default function Profile(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const {
    user,
    points,
    pointsHistory,
    stats,
    loading,
    loadProfileData
  } = useProfileData();
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);
  const handleLogout = () => {
    // 退出登录逻辑
    console.log('退出登录');
    $w.utils.navigateTo({
      pageId: 'login'
    });
  };
  const menuGroups = [{
    title: '我的订单',
    items: [{
      icon: ShoppingBag,
      title: '全部订单',
      path: 'orderList'
    }, {
      icon: Truck,
      title: '待收货',
      path: 'orderList',
      params: {
        status: '待收货'
      }
    }, {
      icon: MessageCircle,
      title: '评价中心',
      path: 'reviews'
    }]
  }, {
    title: '我的资产',
    items: [{
      icon: Gift,
      title: '优惠券',
      path: 'coupons',
      badge: stats.coupons
    }, {
      icon: Star,
      title: '积分商城',
      path: 'points'
    }, {
      icon: CreditCard,
      title: '我的钱包',
      path: 'wallet'
    }]
  }, {
    title: '账户设置',
    items: [{
      icon: MapPin,
      title: '收货地址',
      path: 'address'
    }, {
      icon: Heart,
      title: '我的收藏',
      path: 'favorites'
    }, {
      icon: Settings,
      title: '账户设置',
      path: 'settings'
    }]
  }];
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600" />
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4" />
            <div className="h-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 用户信息头部 */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative p-6">
          <UserAvatar user={user} />
          <div className="mt-4">
            <MemberLevel level={user?.level || 1} points={points} />
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="px-4 -mt-8">
        <UserStats stats={stats} />
      </div>

      {/* 订单状态 */}
      <div className="px-4 mt-4">
        <OrderStatusCard stats={stats} />
      </div>

      {/* 功能菜单 */}
      <div className="mt-4">
        {menuGroups.map((group, groupIndex) => <div key={groupIndex} className="mb-4">
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium text-gray-600">{group.title}</h3>
            </div>
            <div className="bg-white">
              {group.items.map((item, itemIndex) => <MenuItem key={itemIndex} icon={item.icon} title={item.title} badge={item.badge} onClick={() => $w.utils.navigateTo({
            pageId: item.path,
            params: item.params
          })} />)}
            </div>
          </div>)}
      </div>

      {/* 退出登录 */}
      <div className="px-4 mt-8">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>

      {/* 底部导航 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}