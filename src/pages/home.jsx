// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, ShoppingCart, Users } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
// @ts-ignore;
import { VirtualizedList } from '@/components/VirtualizedList';
const ProductCard = memo(({
  product,
  onAddToCart
}) => {
  return <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <LazyImage src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-blue-600">¥{product.price}</span>
          <Badge variant="secondary">{product.sales || 0}人已购</Badge>
        </div>
        <Button className="w-full" onClick={() => onAddToCart(product)} size="sm">
          <ShoppingCart className="w-4 h-4 mr-2" />
          加入购物车
        </Button>
      </CardContent>
    </Card>;
});
const BannerCarousel = memo(({
  banners
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);
  return <div className="relative h-48 overflow-hidden rounded-lg">
      {banners.map((banner, index) => <LazyImage key={banner._id} src={banner.image} alt={banner.title} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`} />)}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`} />)}
      </div>
    </div>;
});
const CategoryCard = memo(({
  category,
  onClick
}) => {
  return <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <LazyImage src={category.icon || 'https://via.placeholder.com/48'} alt={category.name} className="w-12 h-12 mx-auto mb-2" />
      <p className="text-sm font-medium">{category.name}</p>
    </Card>;
});
export default function Home(props) {
  const {
    $w
  } = props;
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    toast
  } = useToast();
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, bannersRes, categoriesRes] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetRecordsV2',
        params: {
          limit: 10,
          orderBy: [{
            sales: 'desc'
          }],
          select: {
            $master: true
          }
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'banner',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          }
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          }
        }
      })]);
      setProducts(productsRes.records || []);
      setBanners(bannersRes.records || []);
      setCategories(categoriesRes.records || []);
    } catch (error) {
      toast({
        title: "获取数据失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleAddToCart = useCallback(async product => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: $w.auth.currentUser?.userId || 'demo_user',
            productId: product._id,
            productName: product.name,
            productImage: product.image,
            price: product.price,
            quantity: 1,
            selected: true
          }
        }
      });
      toast({
        title: "添加成功",
        description: `${product.name} 已加入购物车`
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: error.message,
        variant: "destructive"
      });
    }
  }, []);
  const handleCategoryClick = useCallback(category => {
    $w.utils.navigateTo({
      pageId: 'productList',
      params: {
        categoryId: category._id
      }
    });
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="home" />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* 搜索栏 */}
      <div className="sticky top-0 bg-white z-10 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="搜索商品..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 轮播图 */}
        {banners.length > 0 && <BannerCarousel banners={banners} />}

        {/* 分类导航 */}
        <div className="grid grid-cols-4 gap-4">
          {categories.slice(0, 8).map(category => <CategoryCard key={category._id} category={category} onClick={() => handleCategoryClick(category)} />)}
        </div>

        {/* 热门商品 */}
        <div>
          <h2 className="text-xl font-bold mb-4">热门推荐</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />)}
          </div>
        </div>

        {/* 拼团活动 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">限时拼团</h2>
            <Button variant="ghost" onClick={() => $w.utils.navigateTo({
            pageId: 'groupList'
          })}>
              查看更多
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map(product => <Card key={product._id} className="overflow-hidden">
                <LazyImage src={product.image} alt={product.name} className="w-full h-32 object-cover" />
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 font-bold">¥{product.price}</span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {product.sales || 0}人团
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>;
}