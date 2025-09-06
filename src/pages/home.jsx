// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
// @ts-ignore;
import { Search, ShoppingCart, User, Bell, Star, TrendingUp, Clock, MapPin } from 'lucide-react';

// @ts-ignore;
import Carousel from '@/components/Carousel';
// @ts-ignore;
import CategoryCard from '@/components/CategoryCard';
// @ts-ignore;
import ProductCard from '@/components/ProductCard';
// @ts-ignore;
import TabBar from '@/components/TabBar';

// 首页数据Hook
const useHomeData = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadHomeData = async () => {
    try {
      setLoading(true);

      // 获取轮播图数据
      const bannerRes = await $w.cloud.callDataSource({
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
          orderBy: [{
            sortOrder: 'asc'
          }],
          select: {
            $master: true
          }
        }
      });
      setBanners(bannerRes.records || []);

      // 获取商品分类
      const categoryRes = await $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_active: {
                $eq: true
              },
              level: {
                $eq: 1
              }
            }
          },
          orderBy: [{
            sort_order: 'asc'
          }],
          select: {
            $master: true
          }
        }
      });
      setCategories(categoryRes.records || []);

      // 获取商品列表
      const productRes = await $w.cloud.callDataSource({
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
          orderBy: [{
            sales: 'desc'
          }],
          pageSize: 10,
          select: {
            $master: true
          }
        }
      });
      setProducts(productRes.records || []);

      // 获取热门商品
      const hotRes = await $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_hot: {
                $eq: true
              },
              status: {
                $eq: 'active'
              }
            }
          },
          orderBy: [{
            sales: 'desc'
          }],
          pageSize: 6,
          select: {
            $master: true
          }
        }
      });
      setHotProducts(hotRes.records || []);

      // 获取新品
      const newRes = await $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_new: {
                $eq: true
              },
              status: {
                $eq: 'active'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 6,
          select: {
            $master: true
          }
        }
      });
      setNewProducts(newRes.records || []);
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
    banners,
    categories,
    products,
    hotProducts,
    newProducts,
    loading,
    loadHomeData
  };
};

// 搜索栏组件
const SearchBar = ({
  onSearch
}) => <div className="p-4 bg-white">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input type="text" placeholder="搜索商品、品牌" className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onKeyPress={e => {
      if (e.key === 'Enter') {
        onSearch(e.target.value);
      }
    }} />
    </div>
  </div>;

// 首页头部组件
const HomeHeader = () => <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold">学习用品商城</h1>
      <div className="flex items-center space-x-4">
        <Bell className="w-6 h-6" />
        <ShoppingCart className="w-6 h-6" />
        <User className="w-6 h-6" />
      </div>
    </div>
  </div>;
export default function Home(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const {
    banners,
    categories,
    products,
    hotProducts,
    newProducts,
    loading,
    loadHomeData
  } = useHomeData();
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);
  const handleSearch = keyword => {
    $w.utils.navigateTo({
      pageId: 'search',
      params: {
        keyword
      }
    });
  };
  const handleProductClick = productId => {
    $w.utils.navigateTo({
      pageId: 'productDetail',
      params: {
        productId
      }
    });
  };
  const handleCategoryClick = categoryId => {
    $w.utils.navigateTo({
      pageId: 'category',
      params: {
        categoryId
      }
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <HomeHeader />
        <SearchBar onSearch={handleSearch} />
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded" />)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <SearchBar onSearch={handleSearch} />
      
      {/* 轮播图 */}
      {banners.length > 0 && <div className="px-4 pt-4">
          <Carousel banners={banners} onBannerClick={banner => {
        if (banner.linkUrl) {
          $w.utils.navigateTo({
            pageId: banner.linkUrl
          });
        }
      }} />
        </div>}

      {/* 分类导航 */}
      {categories.length > 0 && <div className="px-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            {categories.slice(0, 8).map(category => <CategoryCard key={category._id} category={category} onClick={() => handleCategoryClick(category._id)} />)}
          </div>
        </div>}

      {/* 热门推荐 */}
      {hotProducts.length > 0 && <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">热门推荐</h2>
            <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
          pageId: 'hotProducts'
        })}>
              查看更多
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotProducts.slice(0, 4).map(product => <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product._id)} />)}
          </div>
        </div>}

      {/* 新品上市 */}
      {newProducts.length > 0 && <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">新品上市</h2>
            <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
          pageId: 'newProducts'
        })}>
              查看更多
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {newProducts.slice(0, 4).map(product => <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product._id)} />)}
          </div>
        </div>}

      {/* 猜你喜欢 */}
      {products.length > 0 && <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">猜你喜欢</h2>
            <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
          pageId: 'products'
        })}>
              查看更多
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 6).map(product => <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product._id)} />)}
          </div>
        </div>}

      {/* 底部导航 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}