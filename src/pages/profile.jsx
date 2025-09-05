// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { User, Settings, CreditCard, Package, Heart, MessageCircle, HelpCircle, ChevronRight, Star, TrendingUp } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar.jsx';
import { ProfileHeader } from '@/components/ProfileHeader.jsx';
import { PointsHistory } from '@/components/PointsHistory.jsx';

// 个人中心头部组件
function ProfileHeaderComponent({
  user,
  stats,
  onEditProfile
}) {
  if (!user) {
    return <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-white text-lg font-bold">未登录</h2>
            <p className="text-white/80 text-sm">点击登录/注册</p>
          </div>
          <ChevronRight size={20} className="text-white/80 ml-auto" />
        </div>
        <div className="flex justify-around mt-6">
          <div className="text-center">
            <div className="text-white text-xl font-bold">0</div>
            <div className="text-white/80 text-xs">积分</div>
          </div>
          <div className="text-center">
            <div className="text-white text-xl font-bold">0</div>
            <div className="text-white/80 text-xs">收藏</div>
          </div>
          <div className="text-center">
            <div className="text-white text-xl font-bold">0</div>
            <div className="text-white/80 text-xs">足迹</div>
          </div>
        </div>
      </div>;
  }
  return <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
      <div className="flex items-center">
        <img src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face"} alt="用户头像" className="w-16 h-16 rounded-full border-2 border-white" />
        <div className="ml-4">
          <h2 className="text-white text-lg font-bold">{user.nickname || '用户'}</h2>
          <p className="text-white/80 text-sm">{user.level || '普通会员'}</p>
        </div>
        <button onClick={onEditProfile} className="ml-auto">
          <Settings size={20} className="text-white/80" />
        </button>
      </div>
      <div className="flex justify-around mt-6">
        <div className="text-center">
          <div className="text-white text-xl font-bold">{user.points || 0}</div>
          <div className="text-white/80 text-xs">积分</div>
        </div>
        <div className="text-center">
          <div className="text-white text-xl font-bold">{user.favorites_count || 0}</div>
          <div className="text-white/80 text-xs">收藏</div>
        </div>
        <div className="text-center">
          <div className="text-white text-xl font-bold">{user.history_count || 0}</div>
          <div className="text-white/80 text-xs">足迹</div>
        </div>
      </div>
    </div>;
}

// 订单状态组件
function OrderStatus({
  counts
}) {
  const statuses = [{
    icon: Package,
    label: '待付款',
    count: counts?.pending || 0
  }, {
    icon: Package,
    label: '待发货',
    count: counts?.shipping || 0
  }, {
    icon: Package,
    label: '待收货',
    count: counts?.received || 0
  }, {
    icon: MessageCircle,
    label: '待评价',
    count: counts?.review || 0
  }];
  return <div className="bg-white p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">我的订单</h3>
      <div className="flex justify-around">
        {statuses.map((status, index) => <div key={index} className="text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <status.icon size={16} className="text-orange-600" />
            </div>
            <div className="text-xs text-gray-600">{status.label}</div>
            {status.count > 0 && <div className="text-xs text-orange-600">{status.count}</div>}
          </div>)}
      </div>
    </div>;
}

// 功能列表组件
function FeatureList({
  features,
  onFeatureClick
}) {
  return <div className="bg-white">
      {features.map((feature, index) => <div key={index}>
          <div onClick={() => onFeatureClick(feature.id)} className="flex items-center p-4 border-b border-gray-100">
            <div className="w-6 h-6 flex items-center justify-center">
              <feature.icon size={20} className="text-gray-600" />
            </div>
            <span className="ml-3 text-sm text-gray-900 flex-1">{feature.title}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>)}
    </div>;
}

// 空状态组件
function EmptyState({
  icon: Icon,
  title,
  description
}) {
  return <div className="flex flex-col items-center justify-center py-20">
      <Icon size={64} className="text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-2">{title}</p>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm">
        重新加载
      </button>
    </div>;
}

// 加载状态组件
function LoadingState() {
  return <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>;
}
export default function ProfilePage(props) {
  const {
    $w
  } = props;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    favorites: 0,
    history: 0,
    orders: {
      pending: 0,
      shipping: 0,
      received: 0,
      review: 0
    }
  });
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const {
    toast
  } = useToast();

  // 功能列表
  const features = [{
    id: 'orders',
    icon: Package,
    title: '我的订单'
  }, {
    id: 'favorites',
    icon: Heart,
    title: '我的收藏'
  }, {
    id: 'address',
    icon: Package,
    title: '收货地址'
  }, {
    id: 'points',
    icon: Star,
    title: '积分中心'
  }, {
    id: 'help',
    icon: HelpCircle,
    title: '帮助中心'
  }, {
    id: 'settings',
    icon: Settings,
    title: '设置'
  }];

  // 加载用户数据
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = $w.auth.currentUser;
      if (!currentUser) {
        setUser(null);
        return;
      }

      // 加载用户资料
      const userResult = await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: currentUser.userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (userResult) {
        setUser(userResult);

        // 设置统计数据
        setStats({
          points: userResult.points || 0,
          favorites: userResult.favorites_count || 0,
          history: userResult.history_count || 0,
          orders: userResult.order_stats || {
            pending: 0,
            shipping: 0,
            received: 0,
            review: 0
          }
        });
      } else {
        // 如果没有用户资料，创建默认数据
        const defaultUser = {
          user_id: currentUser.userId,
          nickname: currentUser.name || currentUser.nickName || '用户',
          avatar_url: currentUser.avatarUrl || '',
          points: 0,
          favorites_count: 0,
          history_count: 0,
          level: '普通会员',
          is_vip: false,
          order_stats: {
            pending: 0,
            shipping: 0,
            received: 0,
            review: 0
          }
        };
        setUser(defaultUser);
        setStats({
          points: 0,
          favorites: 0,
          history: 0,
          orders: {
            pending: 0,
            shipping: 0,
            received: 0,
            review: 0
          }
        });
      }

      // 加载积分历史
      const pointsResult = await $w.cloud.callDataSource({
        dataSourceName: 'points_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: currentUser.userId
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            created_at: 'desc'
          }],
          pageSize: 5
        }
      });
      if (pointsResult.records) {
        setPointsHistory(pointsResult.records);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setError(error.message || '加载失败');
      toast({
        title: '加载失败',
        description: '无法加载用户数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理功能点击
  const handleFeatureClick = featureId => {
    console.log('点击功能:', featureId);
    // 跳转到对应页面
    // $w.utils.navigateTo({ 
    //   pageId: featureId 
    // });
  };

  // 处理编辑资料
  const handleEditProfile = () => {
    // $w.utils.navigateTo({ 
    //   pageId: 'editProfile' 
    // });
  };

  // 初始加载
  useEffect(() => {
    loadUserData();
  }, []);

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return <div className="space-y-4">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="px-4">
            <div className="h-20 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>;
    }
    if (error) {
      return <EmptyState icon={User} title="加载失败" description={error} />;
    }
    return <div>
        {/* 个人中心头部 */}
        <ProfileHeaderComponent user={user} stats={stats} onEditProfile={handleEditProfile} />

        {/* 订单状态 */}
        <div className="mx-4 mt-4">
          <OrderStatus counts={stats.orders} />
        </div>

        {/* 功能列表 */}
        <div className="mx-4 mt-4">
          <FeatureList features={features} onFeatureClick={handleFeatureClick} />
        </div>

        {/* 积分历史 */}
        <div className="mx-4 mt-4">
          <PointsHistory points={stats.points} history={pointsHistory} />
        </div>
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 主要内容 */}
      {renderContent()}

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}