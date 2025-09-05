// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, ShoppingCart, Bell, ChevronRight, Star, TrendingUp, Package, Users, Clock } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar.jsx';
import { Carousel } from '@/components/Carousel.jsx';
import { CategoryCard } from '@/components/CategoryCard.jsx';
import { ProductCard } from '@/components/ProductCard.jsx';
import { GroupCard } from '@/components/GroupCard.jsx';

// 轮播图组件
function BannerCarousel({
  banners,
  onBannerClick
}) {
  if (!banners || banners.length === 0) {
    return <div className="h-48 bg-gray-200 flex items-center justify-center">
        <Package size={32} className="text-gray-400" />
      </div>;
  }
  return <div className="relative">
      <Carousel banners={banners} onClick={onBannerClick} />
    </div>;
}

// 搜索栏组件
function SearchBar({
  onSearch
}) {
  return <div className="px-4 py-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="搜索商品、品牌" className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" onKeyPress={e => {
        if (e.key === 'Enter') {
          onSearch(e.target.value);
        }
      }} />
      </div>
    </div>;
}

// 分类网格组件
function CategoryGrid({
  categories,
  onCategoryClick
}) {
  if (!categories || categories.length === 0) {
    return <div className="px-4 py-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>)}
        </div>
      </div>;
  }
  return <div className="px-4 py-6">
      <div className="grid grid-cols-4 gap-4">
        {categories.map(category => <CategoryCard key={category._id} category={category} onClick={() => onCategoryClick(category._id)} />)}
      </div>
    </div>;
}

// 商品列表组件
function ProductSection({
  title,
  products,
  onProductClick,
  onViewMore
}) {
  if (!products || products.length === 0) {
    return <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button className="text-sm text-orange-600 flex items-center">
            查看更多 <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>)}
        </div>
      </div>;
  }
  return <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onViewMore} className="text-sm text-orange-600 flex items-center">
          查看更多 <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {products.map(product => <ProductCard key={product._id} product={product} onClick={() => onProductClick(product._id)} />)}
      </div>
    </div>;
}

// 拼团活动组件
function GroupSection({
  title,
  groups,
  onGroupClick,
  onViewMore
}) {
  if (!groups || groups.length === 0) {
    return <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button className="text-sm text-orange-600 flex items-center">
            查看更多 <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>)}
        </div>
      </div>;
  }
  return <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onViewMore} className="text-sm text-orange-600 flex items-center">
          查看更多 <ChevronRight size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {groups.map(group => <GroupCard key={group._id} group={group} onClick={() => onGroupClick(group._id)} />)}
      </div>
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

// 错误状态组件
function ErrorState({
  message,
  onRetry
}) {
  return <div className="flex flex-col items-center justify-center py-20">
      <Package size={48} className="text-red-500 mb-4" />
      <p className="text-gray-500 mb-2">加载失败</p>
      <p className="text-gray-400 text-sm mb-4">{message}</p>
      <button onClick={onRetry} className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm">
        重新加载
      </button>
    </div>;
}
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [groupActivities, setGroupActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();

  // 加载首页数据
  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行加载所有数据
      const [bannerResult, categoryResult, hotProductsResult, newProductsResult, groupResult] = await Promise.allSettled([
      // 加载轮播图
      $w.cloud.callDataSource({
        dataSourceName: 'banner',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_active: true
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sort_order: 'asc'
          }]
        }
      }),
      // 加载商品分类
      $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_active: true
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sort_order: 'asc'
          }]
        }
      }),
      // 加载热门商品
      $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_hot: true
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sales: 'desc'
          }],
          pageSize: 4
        }
      }),
      // 加载新品商品
      $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_new: true
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 4
        }
      }),
      // 加载拼团活动
      $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: 'active'
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            end_time: 'asc'
          }],
          pageSize: 3
        }
      })]);

      // 处理轮播图数据
      if (bannerResult.status === 'fulfilled' && bannerResult.value.records) {
        setBanners(bannerResult.value.records);
      } else {
        console.warn('轮播图加载失败:', bannerResult.reason);
      }

      // 处理分类数据
      if (categoryResult.status === 'fulfilled' && categoryResult.value.records) {
        setCategories(categoryResult.value.records);
      } else {
        console.warn('分类加载失败:', categoryResult.reason);
      }

      // 处理热门商品
      if (hotProductsResult.status === 'fulfilled' && hotProductsResult.value.records) {
        setHotProducts(hotProductsResult.value.records);
      } else {
        console.warn('热门商品加载失败:', hotProductsResult.reason);
      }

      // 处理新品商品
      if (newProductsResult.status === 'fulfilled' && newProductsResult.value.records) {
        setNewProducts(newProductsResult.value.records);
      } else {
        console.warn('新品商品加载失败:', newProductsResult.reason);
      }

      // 处理拼团活动
      if (groupResult.status === 'fulfilled' && groupResult.value.records) {
        setGroupActivities(groupResult.value.records);
      } else {
        console.warn('拼团活动加载失败:', groupResult.reason);
      }

      // 检查是否有数据
      const hasData = banners.length > 0 || categories.length > 0 || hotProducts.length > 0 || newProducts.length > 0 || groupActivities.length > 0;
      if (!hasData) {
        toast({
          title: '提示',
          description: '暂无数据，请检查数据模型',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('加载首页数据失败:', error);
      setError(error.message || '加载失败');
      toast({
        title: '加载失败',
        description: '无法加载首页数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = query => {
    console.log('搜索:', query);
    // 跳转到搜索结果页
    // $w.utils.navigateTo({ 
    //   pageId: 'search', 
    //   params: { keyword: query } 
    // });
  };

  // 处理分类点击
  const handleCategoryClick = categoryId => {
    console.log('点击分类:', categoryId);
    // 跳转到分类商品页
    // $w.utils.navigateTo({ 
    //   pageId: 'category', 
    //   params: { categoryId } 
    // });
  };

  // 处理商品点击
  const handleProductClick = productId => {
    console.log('点击商品:', productId);
    // 跳转到商品详情页
    // $w.utils.navigateTo({ 
    //   pageId: 'productDetail', 
    //   params: { id: productId } 
    // });
  };

  // 处理拼团点击
  const handleGroupClick = groupId => {
    console.log('点击拼团:', groupId);
    // 跳转到拼团详情页
    // $w.utils.navigateTo({ 
    //   pageId: 'groupDetail', 
    //   params: { id: groupId } 
    // });
  };

  // 处理查看更多
  const handleViewMore = type => {
    console.log('查看更多:', type);
    // 跳转到对应列表页
    // $w.utils.navigateTo({ 
    //   pageId: type 
    // });
  };

  // 处理轮播图点击
  const handleBannerClick = banner => {
    console.log('点击轮播图:', banner);
    if (banner.link_url) {
      // 处理跳转逻辑
      const url = new URL(banner.link_url, window.location.origin);
      const params = new URLSearchParams(url.search);
      const productId = params.get('productId');
      if (productId) {
        // $w.utils.navigateTo({ 
        //   pageId: 'productDetail', 
        //   params: { id: productId } 
        // });
      } else {
        // $w.utils.navigateTo({ 
        //   pageId: url.pathname.replace('/pages/', '') 
        // });
      }
    }
  };

  // 初始加载
  useEffect(() => {
    loadHomeData();
  }, []);

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return <div className="space-y-6">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="px-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
                </div>)}
            </div>
          </div>
          <div className="px-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i}>
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>)}
            </div>
          </div>
        </div>;
    }
    if (error) {
      return <ErrorState message={error} onRetry={loadHomeData} />;
    }
    return <div>
        {/* 顶部通知栏 */}
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Bell size={16} className="mr-2" />
            <span className="text-sm">开学季大促，全场8折起！</span>
          </div>
          <button className="text-sm">查看</button>
        </div>

        {/* 轮播图 */}
        <BannerCarousel banners={banners} onBannerClick={handleBannerClick} />

        {/* 搜索栏 */}
        <SearchBar onSearch={handleSearch} />

        {/* 商品分类 */}
        <CategoryGrid categories={categories} onCategoryClick={handleCategoryClick} />

        {/* 热门商品 */}
        {hotProducts.length > 0 && <ProductSection title="热门推荐" products={hotProducts} onProductClick={handleProductClick} onViewMore={() => handleViewMore('hotProducts')} />}

        {/* 新品上市 */}
        {newProducts.length > 0 && <ProductSection title="新品上市" products={newProducts} onProductClick={handleProductClick} onViewMore={() => handleViewMore('newProducts')} />}

        {/* 拼团活动 */}
        {groupActivities.length > 0 && <GroupSection title="限时拼团" groups={groupActivities} onGroupClick={handleGroupClick} onViewMore={() => handleViewMore('groupList')} />}
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 主要内容 */}
      {renderContent()}

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}