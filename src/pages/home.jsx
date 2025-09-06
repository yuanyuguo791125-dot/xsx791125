// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, TabBar, TestIntegration } from '@/components/ui';
// @ts-ignore;
import { ShoppingBag, Gift, Clock, Users, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';

// @ts-ignore;
import { Carousel } from '@/components/Carousel';
// @ts-ignore;
import { CategoryCard } from '@/components/CategoryCard';
// @ts-ignore;
import { ProductCard } from '@/components/ProductCard';
// @ts-ignore;
import { GroupCard } from '@/components/GroupCard';
// @ts-ignore;
import { CountdownTimer } from '@/components/CountdownTimer';

// 图片路径处理
const processImageUrl = url => {
  if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
  if (url.startsWith('cloud://')) {
    return url.replace('cloud://', 'https://your-cdn.com/');
  }
  if (url.startsWith('/')) {
    return `https://your-cdn.com${url}`;
  }
  return url;
};

// 数据加载Hook
const useHomeData = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();

  // 验证banner数据源
  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'banner',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sortOrder: 'asc'
          }],
          pageSize: 10
        }
      });

      // 验证数据格式
      if (!res || !Array.isArray(res.records)) {
        throw new Error('Banner数据格式错误');
      }
      const bannerData = res.records.map(banner => ({
        id: banner._id,
        title: banner.title || 'Banner标题',
        imageUrl: banner.imageUrl || '',
        linkUrl: banner.linkUrl || '#',
        sortOrder: banner.sortOrder || 0
      }));
      setBanners(bannerData);
      console.log('✅ Banner数据源验证成功', bannerData.length, '条数据');
    } catch (err) {
      console.error('❌ Banner数据源错误:', err);
      toast({
        title: 'Banner加载失败',
        description: err.message,
        variant: 'destructive'
      });

      // 使用默认数据
      setBanners([{
        id: 'default-1',
        title: '默认Banner1',
        imageUrl: 'https://via.placeholder.com/400x200?text=Banner+1',
        linkUrl: '#',
        sortOrder: 1
      }]);
    }
  }, [toast]);

  // 验证商品分类数据源
  const loadCategories = useCallback(async () => {
    try {
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sortOrder: 'asc'
          }],
          pageSize: 8
        }
      });
      if (!res || !Array.isArray(res.records)) {
        throw new Error('分类数据格式错误');
      }
      const categoryData = res.records.map(category => ({
        id: category._id,
        name: category.name || '分类名称',
        icon: category.icon || '📦',
        sortOrder: category.sortOrder || 0
      }));
      setCategories(categoryData);
      console.log('✅ 分类数据源验证成功', categoryData.length, '条数据');
    } catch (err) {
      console.error('❌ 分类数据源错误:', err);
      // 使用默认分类
      setCategories([{
        id: '1',
        name: '热门推荐',
        icon: '🔥',
        sortOrder: 1
      }, {
        id: '2',
        name: '新品上市',
        icon: '✨',
        sortOrder: 2
      }, {
        id: '3',
        name: '限时特惠',
        icon: '⏰',
        sortOrder: 3
      }, {
        id: '4',
        name: '品牌专区',
        icon: '🏷️',
        sortOrder: 4
      }]);
    }
  }, []);

  // 验证商品数据源
  const loadProducts = useCallback(async () => {
    try {
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sortOrder: 'asc'
          }, {
            createdAt: 'desc'
          }],
          pageSize: 6
        }
      });
      if (!res || !Array.isArray(res.records)) {
        throw new Error('商品数据格式错误');
      }
      const productData = res.records.map(product => ({
        id: product._id,
        name: product.name || '商品名称',
        image: product.image || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        sales: product.sales || 0,
        stock: product.stock || 0
      }));
      setProducts(productData);
      console.log('✅ 商品数据源验证成功', productData.length, '条数据');
    } catch (err) {
      console.error('❌ 商品数据源错误:', err);
    }
  }, []);

  // 验证拼团数据源
  const loadGroups = useCallback(async () => {
    try {
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              },
              endTime: {
                $gte: new Date().getTime()
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sortOrder: 'asc'
          }],
          pageSize: 4
        }
      });
      if (!res || !Array.isArray(res.records)) {
        throw new Error('拼团数据格式错误');
      }
      const groupData = res.records.map(group => ({
        id: group._id,
        title: group.title || '拼团活动',
        image: group.image || '',
        price: group.price || 0,
        originalPrice: group.originalPrice || 0,
        endTime: group.endTime || Date.now() + 3600000,
        participants: group.participants || 0,
        target: group.target || 2
      }));
      setGroups(groupData);
      console.log('✅ 拼团数据源验证成功', groupData.length, '条数据');
    } catch (err) {
      console.error('❌ 拼团数据源错误:', err);
    }
  }, []);

  // 加载所有数据
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadBanners(), loadCategories(), loadProducts(), loadGroups()]);
      console.log('✅ 全链路数据加载完成');
    } catch (err) {
      setError(err.message);
      console.error('❌ 数据加载失败:', err);
    } finally {
      setLoading(false);
    }
  }, [loadBanners, loadCategories, loadProducts, loadGroups]);
  return {
    banners,
    categories,
    products,
    groups,
    loading,
    error,
    loadAllData
  };
};

// 骨架屏组件
const HomeSkeleton = () => <div className="space-y-4 p-4">
    {/* Banner骨架 */}
    <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
    
    {/* 分类骨架 */}
    <div className="grid grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <div key={i} className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
        </div>)}
    </div>
    
    {/* 商品骨架 */}
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-lg p-3">
          <div className="w-full h-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-1" />
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
        </div>)}
    </div>
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

// 添加测试模式检测
const TestModeIndicator = () => {
  const [isTestMode, setIsTestMode] = useState(false);
  useEffect(() => {
    const checkTestMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      setIsTestMode(urlParams.has('test'));
    };
    checkTestMode();
    window.addEventListener('popstate', checkTestMode);
    return () => window.removeEventListener('popstate', checkTestMode);
  }, []);
  if (!isTestMode) return null;
  return <div className="fixed top-4 right-4 z-50">
      <Card className="bg-blue-500 text-white">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            <span className="text-sm font-bold">测试模式</span>
          </div>
        </CardContent>
      </Card>
    </div>;
};

// 修改主组件添加测试支持
export default function Home(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [refreshing, setRefreshing] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const {
    banners,
    categories,
    products,
    groups,
    loading,
    error,
    loadAllData
  } = useHomeData();

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // 页面加载
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 检测测试模式
  useEffect(() => {
    const checkTestMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      setIsTestMode(urlParams.has('test'));
    };
    checkTestMode();
    window.addEventListener('popstate', checkTestMode);
    return () => window.removeEventListener('popstate', checkTestMode);
  }, []);

  // 渲染Banner
  const renderBanner = () => {
    if (banners.length === 0) return null;
    return <Carousel banners={banners.map(banner => ({
      id: banner.id,
      image: processImageUrl(banner.imageUrl),
      title: banner.title,
      link: banner.linkUrl
    }))} />;
  };

  // 渲染分类
  const renderCategories = () => {
    if (categories.length === 0) return null;
    return <div className="grid grid-cols-4 gap-4 p-4">
        {categories.map(category => <CategoryCard key={category.id} name={category.name} icon={category.icon} onClick={() => $w.utils.navigateTo({
        pageId: 'category',
        params: {
          categoryId: category.id
        }
      })} />)}
      </div>;
  };

  // 渲染商品
  const renderProducts = () => {
    if (products.length === 0) return null;
    return <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">热门推荐</h2>
          <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
          pageId: 'productList'
        })}>
            查看更多
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => <ProductCard key={product.id} product={product} onClick={() => $w.utils.navigateTo({
          pageId: 'productDetail',
          params: {
            productId: product.id
          }
        })} />)}
        </div>
      </div>;
  };

  // 渲染拼团
  const renderGroups = () => {
    if (groups.length === 0) return null;
    return <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">限时拼团</h2>
          <CountdownTimer endTime={Math.min(...groups.map(g => g.endTime))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {groups.map(group => <GroupCard key={group.id} group={group} onClick={() => $w.utils.navigateTo({
          pageId: 'groupDetail',
          params: {
            groupId: group.id
          }
        })} />)}
        </div>
      </div>;
  };

  // 渲染加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <HomeSkeleton />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>;
  }

  // 渲染错误状态
  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState message={error} onRetry={loadAllData} />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      <TestModeIndicator />
      
      {/* 下拉刷新指示器 */}
      {refreshing && <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2">
          正在刷新...
        </div>}

      {/* Banner区域 */}
      {renderBanner()}

      {/* 分类导航 */}
      {renderCategories()}

      {/* 拼团活动 */}
      {renderGroups()}

      {/* 热门商品 */}
      {renderProducts()}

      {/* 底部导航 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* 测试面板 */}
      {isTestMode && <TestIntegration />}
    </div>;
}