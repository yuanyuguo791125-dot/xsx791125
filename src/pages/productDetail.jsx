// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Tabs, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart, Heart, Share2, Star, Clock, AlertCircle, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { ImageGallery } from '@/components/ImageGallery';
// @ts-ignore;
import { ActionBar } from '@/components/ActionBar';
// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';

// 数据加载Hook
const useProductDetail = productId => {
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const loadProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行加载商品详情和库存信息
      const [productRes, inventoryRes] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'product_detail',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: productId
              }
            }
          },
          select: {
            $master: true
          }
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'product_inventory',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              productId: {
                $eq: productId
              }
            }
          },
          select: {
            $master: true
          }
        }
      })]);
      // 安全处理商品数据
      const safeProduct = {
        id: productRes._id,
        name: productRes.name || '商品名称',
        images: Array.isArray(productRes.images) ? productRes.images : [productRes.image || ''],
        price: productRes.price || 0,
        originalPrice: productRes.originalPrice || 0,
        description: productRes.description || '',
        specifications: productRes.specifications || {},
        sales: productRes.sales || 0,
        rating: productRes.rating || 0,
        reviews: productRes.reviews || 0
      };
      setProduct(safeProduct);
      setInventory(inventoryRes || {
        stock: 0,
        sku: []
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: '商品加载失败',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);
  return {
    product,
    inventory,
    loading,
    error,
    loadProductDetail
  };
};

// 骨架屏组件
const ProductDetailSkeleton = () => <div className="space-y-4 p-4">
    <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-1/4" />
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
export default function ProductDetail(props) {
  const {
    $w
  } = props;
  const productId = $w.page.dataset.params.productId;
  const [quantity, setQuantity] = useState(1);
  const [selectedSku, setSelectedSku] = useState({});
  const [activeTab, setActiveTab] = useState('detail');
  const {
    product,
    inventory,
    loading,
    error,
    loadProductDetail
  } = useProductDetail(productId);

  // 页面加载
  useEffect(() => {
    if (productId) {
      loadProductDetail();
    }
  }, [loadProductDetail]);

  // 添加到购物车
  const handleAddToCart = useCallback(async () => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: $w.auth.currentUser?.userId || 'demo_user',
            productId: productId,
            quantity: quantity,
            sku: selectedSku,
            createdAt: new Date().toISOString()
          }
        }
      });
      // 显示成功提示
      $w.utils.showToast({
        title: '已添加到购物车'
      });
    } catch (err) {
      $w.utils.showToast({
        title: '添加失败',
        content: err.message,
        icon: 'error'
      });
    }
  }, [productId, quantity, selectedSku]);

  // 立即购买
  const handleBuyNow = useCallback(() => {
    $w.utils.navigateTo({
      pageId: 'payment',
      params: {
        productId: productId,
        quantity: quantity,
        sku: selectedSku
      }
    });
  }, [productId, quantity, selectedSku]);

  // 渲染商品信息
  const renderProductInfo = () => {
    if (!product) return null;
    return <div className="space-y-4">
        {/* 商品图片 */}
        <ImageGallery images={product.images.map(img => ({
        url: img,
        alt: product.name
      }))} />

        {/* 商品基本信息 */}
        <Card>
          <CardContent className="p-4">
            <h1 className="text-xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-red-600">¥{product.price}</span>
              <span className="text-sm text-gray-500 line-through">¥{product.originalPrice}</span>
              <Badge variant="destructive">热销</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>销量: {product.sales}</span>
              <span>评分: {product.rating}⭐</span>
              <span>评价: {product.reviews}</span>
            </div>
          </CardContent>
        </Card>

        {/* 规格选择 */}
        {inventory?.sku && inventory.sku.length > 0 && <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">选择规格</h3>
              <div className="space-y-2">
                {inventory.sku.map((sku, index) => <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span>{sku.name}</span>
                    <span className="text-sm text-gray-500">库存: {sku.stock}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>}

        {/* 商品详情 */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detail">商品详情</TabsTrigger>
                <TabsTrigger value="reviews">用户评价</TabsTrigger>
              </TabsList>
            </Tabs>
            {activeTab === 'detail' && <div className="mt-4">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
              __html: product.description
            }} />
              </div>}
            {activeTab === 'reviews' && <div className="mt-4">
                <p className="text-center text-gray-500">暂无评价</p>
              </div>}
          </CardContent>
        </Card>
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <ProductDetailSkeleton />
        <ActionBar onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState message={error} onRetry={loadProductDetail} />
      </div>;
  }
  if (!product) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState message="商品不存在" onRetry={() => $w.utils.navigateBack()} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4">
        {renderProductInfo()}
      </div>
      <ActionBar onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </div>;
}