// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, Package, ChevronLeft, ChevronRight } from 'lucide-react';

// @ts-ignore;
import ImageGallery from '@/components/ImageGallery';
// @ts-ignore;
import ActionBar from '@/components/ActionBar';

// 商品详情数据Hook
const useProductDetail = productId => {
  const [product, setProduct] = useState(null);
  const [detail, setDetail] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSku, setSelectedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const {
    toast
  } = useToast();
  const loadProductDetail = async () => {
    try {
      setLoading(true);

      // 调用云函数获取商品详情
      const productDetail = await $w.cloud.callFunction({
        name: 'getProductDetail',
        data: {
          productId
        }
      });
      if (productDetail.success) {
        setProduct(productDetail.data.product);
        setDetail(productDetail.data.detail);
        setInventory(productDetail.data.inventory);

        // 设置默认SKU
        if (productDetail.data.detail?.sku_list?.length > 0) {
          setSelectedSku(productDetail.data.detail.sku_list[0]);
        }
      } else {
        throw new Error(productDetail.error);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });

      // 降级处理：直接调用数据源
      await loadFromDataSource(productId);
    } finally {
      setLoading(false);
    }
  };
  const loadFromDataSource = async productId => {
    try {
      // 获取商品基本信息
      const productRes = await $w.cloud.callDataSource({
        dataSourceName: 'product',
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
      });

      // 获取商品详情
      const detailRes = await $w.cloud.callDataSource({
        dataSourceName: 'product_detail',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              product_id: {
                $eq: productId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });

      // 获取库存信息
      const inventoryRes = await $w.cloud.callDataSource({
        dataSourceName: 'product_inventory',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              product_id: {
                $eq: productId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setProduct(productRes);
      setDetail(detailRes);
      setInventory(inventoryRes.records?.[0] || null);
      if (detailRes?.sku_list?.length > 0) {
        setSelectedSku(detailRes.sku_list[0]);
      }
    } catch (error) {
      toast({
        title: '数据加载失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  return {
    product,
    detail,
    inventory,
    loading,
    selectedSku,
    quantity,
    setSelectedSku,
    setQuantity,
    loadProductDetail
  };
};

// 商品规格选择器
const SpecificationSelector = ({
  attributes,
  selectedSku,
  onSkuChange
}) => {
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const handleSpecChange = (attrName, value) => {
    const newSpecs = {
      ...selectedSpecs,
      [attrName]: value
    };
    setSelectedSpecs(newSpecs);

    // 查找匹配的SKU
    if (onSkuChange) {
      onSkuChange(newSpecs);
    }
  };
  if (!attributes || attributes.length === 0) return null;
  return <div className="space-y-4">
      {attributes.map(attr => <div key={attr.name}>
          <h4 className="text-sm font-medium mb-2">{attr.name}</h4>
          <div className="flex flex-wrap gap-2">
            {attr.values.map(value => <Button key={value} variant={selectedSpecs[attr.name] === value ? "default" : "outline"} size="sm" onClick={() => handleSpecChange(attr.name, value)}>
                {value}
              </Button>)}
          </div>
        </div>)}
    </div>;
};

// 服务保障展示
const ServiceGuarantees = ({
  guarantees
}) => {
  if (!guarantees || guarantees.length === 0) return null;
  return <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium mb-3">服务保障</h4>
      <div className="space-y-2">
        {guarantees.map((guarantee, index) => <div key={index} className="flex items-center text-sm text-gray-600">
            <Truck className="w-4 h-4 mr-2 text-green-600" />
            <span>{guarantee.text}</span>
          </div>)}
      </div>
    </div>;
};
export default function ProductDetail(props) {
  const {
    $w
  } = props;
  const productId = $w.page.dataset.params.productId;
  const {
    product,
    detail,
    inventory,
    loading,
    selectedSku,
    quantity,
    setSelectedSku,
    setQuantity,
    loadProductDetail
  } = useProductDetail(productId);
  useEffect(() => {
    if (productId) {
      loadProductDetail();
    }
  }, [productId, loadProductDetail]);
  const handleAddToCart = async () => {
    if (!selectedSku || !product) return;
    try {
      // 调用云函数更新购物车
      const result = await $w.cloud.callFunction({
        name: 'updateCart',
        data: {
          productId: product._id,
          skuId: selectedSku.sku,
          quantity: quantity,
          userId: $w.auth.currentUser?.userId || 'guest'
        }
      });
      if (result.success) {
        // 显示成功提示
        // 这里可以添加购物车动画效果
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      // 降级处理：直接操作购物车数据源
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'shopping_cart',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              user_id: $w.auth.currentUser?.userId || 'guest',
              product_id: product._id,
              product_name: product.name,
              price: selectedSku.price,
              quantity: quantity,
              image: product.main_image,
              sku: selectedSku.sku,
              stock: selectedSku.stock,
              is_selected: true,
              specifications: selectedSku.specifications,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });
      } catch (dataError) {
        console.error('添加到购物车失败:', dataError);
      }
    }
  };
  const handleBuyNow = () => {
    if (!selectedSku || !product) return;
    $w.utils.navigateTo({
      pageId: 'payment',
      params: {
        items: [{
          productId: product._id,
          skuId: selectedSku.sku,
          name: product.name,
          price: selectedSku.price,
          quantity: quantity,
          image: product.main_image
        }],
        totalAmount: selectedSku.price * quantity
      }
    });
  };
  const handleShare = () => {
    // 分享功能实现
    console.log('分享商品:', product?.name);
  };
  const handleFavorite = () => {
    // 收藏功能实现
    console.log('收藏商品:', product?.name);
  };
  if (loading) {
    return <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>;
  }
  if (!product || !detail) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">商品不存在或已下架</p>
          <Button variant="outline" className="mt-4" onClick={() => $w.utils.navigateBack()}>
            返回
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-white pb-20">
      {/* 商品图片 */}
      <ImageGallery images={detail.images || [product.main_image]} onBack={() => $w.utils.navigateBack()} />

      {/* 商品信息 */}
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold mb-2">{product.name}</h1>
          {detail.subtitle && <p className="text-sm text-gray-600 mb-2">{detail.subtitle}</p>}
          
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-500">¥{selectedSku?.price || product.price}</span>
            {product.original_price > product.price && <span className="text-sm text-gray-400 line-through">¥{product.original_price}</span>}
          </div>

          {product.rating && <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-sm text-gray-600 ml-2">{product.rating} ({product.review_count}评价)</span>
            </div>}
        </div>

        {/* 规格选择 */}
        {detail.attributes && detail.attributes.length > 0 && <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-3">选择规格</h3>
              <SpecificationSelector attributes={detail.attributes} selectedSku={selectedSku} onSkuChange={specs => {
            // 根据选择的规格找到对应的SKU
            const matchedSku = detail.sku_list?.find(sku => Object.entries(specs).every(([key, value]) => sku.specifications[key] === value));
            if (matchedSku) {
              setSelectedSku(matchedSku);
            }
          }} />
            </CardContent>
          </Card>}

        {/* 数量选择 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">数量</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(Math.min(selectedSku?.stock || product.stock, quantity + 1))}>
                  +
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              库存: {selectedSku?.stock || product.stock}件
            </p>
          </CardContent>
        </Card>

        {/* 服务保障 */}
        {detail.service_guarantees && <ServiceGuarantees guarantees={detail.service_guarantees} />}

        {/* 商品详情 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">商品详情</TabsTrigger>
                <TabsTrigger value="specs" className="flex-1">规格参数</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">用户评价</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div dangerouslySetInnerHTML={{
                __html: detail.details_html || ''
              }} />
              </TabsContent>
              
              <TabsContent value="specs" className="mt-4">
                <div className="space-y-2">
                  {detail.specifications?.map((spec, index) => <div key={index} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{spec.name}</span>
                      <span>{spec.value}</span>
                    </div>)}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <div className="text-center py-8 text-gray-500">
                  暂无评价
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <ActionBar product={product} selectedSku={selectedSku} quantity={quantity} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onShare={handleShare} onFavorite={handleFavorite} />
    </div>;
}