// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Avatar, AvatarImage, AvatarFallback, useToast, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
// @ts-ignore;
import { User, Settings, Gift, History, Camera, Edit3, LogOut, RefreshCw, AlertCircle, MapPin } from 'lucide-react';

// @ts-ignore;
import { ProfileHeader } from '@/components/ProfileHeader';
// @ts-ignore;
import { FeatureCard } from '@/components/FeatureCard';
// @ts-ignore;
import { PointsHistory } from '@/components/PointsHistory';
// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';

// 图片路径处理
const processImageUrl = url => {
  if (!url) return 'https://via.placeholder.com/100x100?text=User';
  if (url.startsWith('cloud://')) {
    return url.replace('cloud://', 'https://your-cdn.com/');
  }
  if (url.startsWith('/')) {
    return `https://your-cdn.com${url}`;
  }
  return url;
};

// 数据加载Hook
const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'demo_user'
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setProfile(res);
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
  }, [toast]);
  const updateProfile = useCallback(async data => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'user_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data,
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'demo_user'
              }
            }
          }
        }
      });
      await loadProfile();
      toast({
        title: '更新成功'
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [loadProfile, toast]);
  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile
  };
};

// 积分历史Hook
const usePointsHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const {
    toast
  } = useToast();
  const loadHistory = useCallback(async (isRefresh = false) => {
    try {
      setLoading(true);
      const currentPage = isRefresh ? 1 : page;
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'points_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'demo_user'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageNumber: currentPage,
          pageSize: 15,
          getCount: true
        }
      });
      const newData = res.records || [];
      if (isRefresh) {
        setHistory(newData);
      } else {
        setHistory(prev => [...prev, ...newData]);
      }
      setTotal(res.total || 0);
      setHasMore(newData.length === 15 && currentPage * 15 < res.total);
      setPage(currentPage + 1);
    } catch (err) {
      toast({
        title: '加载失败',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadHistory(true);
  }, [loadHistory]);
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadHistory();
    }
  }, [loading, hasMore, loadHistory]);
  return {
    history,
    loading,
    hasMore,
    total,
    refresh,
    loadMore
  };
};

// 头像上传组件
function AvatarUpload({
  currentAvatar,
  onUpload
}) {
  const [uploading, setUploading] = useState(false);
  const {
    toast
  } = useToast();
  const handleUpload = useCallback(async file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: '请选择图片文件',
        variant: 'destructive'
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: '图片大小不能超过2MB',
        variant: 'destructive'
      });
      return;
    }
    try {
      setUploading(true);
      // 上传到云存储
      const cloud = await $w.cloud.getCloudInstance();
      const uploadRes = await cloud.uploadFile({
        cloudPath: `avatars/${Date.now()}-${file.name}`,
        file
      });
      const avatarUrl = uploadRes.fileID;
      await onUpload({
        avatar: avatarUrl
      });
      toast({
        title: '头像上传成功'
      });
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  }, [onUpload, toast]);
  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      handleUpload(file);
    };
    input.click();
  }, [handleUpload]);
  return <div className="relative group">
      <Avatar className="w-24 h-24 cursor-pointer">
        <AvatarImage src={processImageUrl(currentAvatar)} alt="用户头像" />
        <AvatarFallback>
          <User className="w-12 h-12" />
        </AvatarFallback>
      </Avatar>
      <button onClick={handleFileSelect} disabled={uploading} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all">
        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
      </button>
      {uploading && <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>}
    </div>;
}

// 编辑资料弹窗
function EditProfileModal({
  profile,
  onSave,
  open,
  onOpenChange
}) {
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);
  const {
    toast
  } = useToast();
  const handleSave = useCallback(async () => {
    if (!nickname.trim()) {
      toast({
        title: '请输入昵称',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSaving(true);
      await onSave({
        nickname: nickname.trim(),
        phone: phone.trim(),
        email: email.trim()
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [nickname, phone, email, onSave, onOpenChange, toast]);
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">昵称</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="请输入昵称" maxLength={20} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">手机号</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="请输入手机号" maxLength={11} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="请输入邮箱" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}

// 骨架屏组件
const ProfileSkeleton = () => <div className="p-4 space-y-4">
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
        </div>
      </CardContent>
    </Card>
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
export default function Profile(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 使用自定义Hook加载数据
  const userProfile = useUserProfile();
  const pointsHistory = usePointsHistory();

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([userProfile.loadProfile(), pointsHistory.refresh()]);
    setRefreshing(false);
  }, [userProfile, pointsHistory]);

  // 页面加载
  useEffect(() => {
    handleRefresh();
  }, []);

  // 渲染用户信息
  const renderUserInfo = () => {
    if (userProfile.loading) {
      return <ProfileSkeleton />;
    }
    if (userProfile.error) {
      return <ErrorState message={userProfile.error} onRetry={userProfile.loadProfile} />;
    }
    if (!userProfile.profile) {
      return <ErrorState message="用户信息加载失败" onRetry={userProfile.loadProfile} />;
    }
    const {
      profile
    } = userProfile;
    return <div className="space-y-4">
        {/* 用户信息卡片 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AvatarUpload currentAvatar={profile.avatar} onUpload={userProfile.updateProfile} />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.nickname || '未设置昵称'}</h2>
                <p className="text-sm text-gray-500">{profile.phone || '未绑定手机号'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Lv.{profile.level || 1}</Badge>
                  <Badge variant="outline">{profile.points || 0} 积分</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(true)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 功能卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard icon={Gift} title="我的积分" value={profile.points || 0} subtitle="可用积分" onClick={() => $w.utils.navigateTo({
          pageId: 'pointsDetail'
        })} />
          <FeatureCard icon={History} title="积分记录" value={pointsHistory.total} subtitle="历史记录" onClick={() => $w.utils.navigateTo({
          pageId: 'pointsHistory'
        })} />
        </div>

        {/* 设置选项 */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Button variant="ghost" className="w-full justify-start" onClick={() => $w.utils.navigateTo({
            pageId: 'addressList'
          })}>
              <MapPin className="w-4 h-4 mr-2" />
              收货地址管理
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => $w.utils.navigateTo({
            pageId: 'settings'
          })}>
              <Settings className="w-4 h-4 mr-2" />
              账号设置
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-600" onClick={() => {
            // 退出登录逻辑
            $w.utils.navigateTo({
              pageId: 'login'
            });
          }}>
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>

        {/* 积分历史 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">积分明细</h3>
              <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
              pageId: 'pointsHistory'
            })}>
                查看全部
              </Button>
            </div>
            <PointsHistory data={pointsHistory.history.slice(0, 5)} loading={pointsHistory.loading} onLoadMore={pointsHistory.loadMore} hasMore={pointsHistory.hasMore} />
          </CardContent>
        </Card>
      </div>;
  };
  return <div className="min-h-screen bg-gray-50">
      {/* 下拉刷新指示器 */}
      {refreshing && <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2">
          正在刷新...
        </div>}

      <div className="p-4">
        {renderUserInfo()}
      </div>

      {/* 编辑资料弹窗 */}
      <EditProfileModal profile={userProfile.profile} onSave={userProfile.updateProfile} open={editModalOpen} onOpenChange={setEditModalOpen} />
    </div>;
}