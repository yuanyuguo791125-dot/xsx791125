// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Heart, Share2, ShoppingCart, Star, Package, Truck, Shield, Clock, Minus, Plus } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { ImageGallery } from '@/components/ImageGallery.jsx';
import { ActionBar } from '@/components/ActionBar.jsx';

// 图片画廊组件
function ProductImageGallery({
  images,
  onImageClick
}) {
  if (!images || images.length === 0) {
    return <div className="h-80 bg-gray-200 flex items-center justify-center">
        <Package size={48} className="text-gray-400" />
      </div>;
  }
  return <ImageGallery images={images} onClick={onImageClick} />;
}

// 商品信息组件
function ProductInfo({
  product,
  detail
}) {
  if (!product) return null;
  return <div className="px-4 py-4">
      {/* 标题和价格 */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-orange-600">¥{product.price}</span>
          {product.original_price > product.price && <span className="text-sm text-gray-500 line-through ml-2">¥{product.original_price}</span>}
          {product.original_price > product.price && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded ml-2">
              {Math.round((1 - product.price / product.original_price) * 100)}% OFF
            </span>}
        </div>
      </div>

      {/* 评分和销量 */}
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className={`${i <= (detail?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
          <span className="text-sm text-gray-600 ml-2">{detail?.rating || 0}分 ({detail?.reviews_count || 0}评价)</span>
        </div>
        <span className="text-sm text-gray-600 ml-4">已售 {detail?.sales_count || product.sales || 0}件</span>
      </div>

      {/* 服务标签 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <Truck size={16} className="text-green-600 mr-1" />
          <span className="text-xs text-gray-600">包邮</span>
        </div>
        <div className="flex items-center">
          <Shield size={16} className="text-blue-600 mr-1" />
          <span className="text-xs text-gray-600">正品保障</span>
        </div>
        <div className="flex items-center">
          <Clock size={16} className="text-purple-600 mr-1" />
          <span className="text-xs text-gray-600">7天无理由退换</span>
        </div>
      </div>
    </div>;
}

// 规格选择组件
function SpecificationSelector({
  skuList,
  attributes,
  onSkuChange
}) {
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [selectedSku, setSelectedSku] = useState(null);

  // 处理规格选择
  const handleSpecChange = (attrName, value) => {
    const newSpecs = {
      ...selectedSpecs,
      [attrName]: value
    };
    setSelectedSpecs(newSpecs);

    // 查找匹配的SKU
    const matchedSku = skuList.find(sku => {
      const specs = sku.specifications || {};
      return Object.keys(newSpecs).every(key => specs[key] === newSpecs[key]);
    });
    setSelectedSku(matchedSku);
    onSkuChange(matchedSku);
  };
  if (!attributes || attributes.length === 0) {
    return null;
  }
  return <div className="px-4 py-4 bg-white">
      <h3 className="text-sm font-medium text-gray-900 mb-3">选择规格</h3>
      {attributes.map(attr => <div key={attr.name} className="mb-3">
          <p className="text-sm text-gray-600 mb-2">{attr.name}</p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map(value => <button key={value} onClick={() => handleSpecChange(attr.name, value)} className={`px-3 py-1 text-sm rounded border ${selectedSpecs[attr.name] === value ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-300 text-gray-700'}`}>
                {value}
              </button>)}
          </div>
        </div>)}
      {selectedSku && <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">已选择: {Object.values(selectedSpecs).join('，')}</p>
          <p className="text-sm text-orange-600 mt-1">价格: ¥{selectedSku.price}</p>
          <p className="text-sm text-gray-600">库存: {selectedSku.stock}件</p>
        </div>}
    </div>;
}

// 商品详情组件
function ProductDetails({
  detail
}) {
  if (!detail) return null;
  return <div className="px-4 py-4">
      <h3 className="text-lg font-bold text-gray-900 mb-3">商品详情</h3>
      {detail.details_html ? <div dangerouslySetInnerHTML={{
      __html: detail.details_html
    }} /> : <div className="text-sm text-gray-600">
          <p>暂无详细描述</p>
        </div>}
      {detail.specifications && <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">规格参数</h4>
          <div className="space-y-2">
            {Object.entries(detail.specifications).map(([key, value]) => <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{key}:</span>
                <span className="text-gray-900">{value}</span>
              </div>)}
          </div>
        </div>}
    </div>;
}

// 评价组件
function ProductReviews({
  reviewsCount,
  rating
}) {
  return <div className="px-4 py-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">用户评价</h3>
        <span className="text-sm text-gray-600">{reviewsCount || 0}条评价</span>
      </div>
      <div className="flex items-center mt-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className={`${i <= (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
        </div>
        <span className="text-sm text-gray-600 ml-2">{rating || 0}分</span>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">暂无评价</p>
      </div>
    </div>;
}

// 空状态组件
function EmptyState() {
  return <div className="flex flex-col items-center justify-center py-20">
      <Package size={64} className="text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-2">商品不存在</p>
      <p className="text-gray-400 text-sm mb-6">该商品可能已下架或不存在</p>
      <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm">
        返回首页
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
export default function ProductDetailPage(props) {
  const {
    $w
  } = props;
  const [product, setProduct] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const {
    toast
  } = useToast();

  // 获取商品ID
  const productId = $w.page.dataset.params?.id;

  // 加载商品数据
  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!productId) {
        setError('商品ID不能为空');
        return;
      }

      // 加载商品基本信息
      const productResult = await $w.cloud.callDataSource({
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
      if (!productResult) {
        setError('商品不存在');
        return;
      }
      setProduct(productResult);

      // 加载商品详情
      const detailResult = await $w.cloud.callDataSource({
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
      setDetail(detailResult);

      // 设置默认SKU
      if (detailResult?.sku_list && detailResult.sku_list.length > 0) {
        setSelectedSku(detailResult.sku_list[0]);
      }
    } catch (error) {
      console.error('加载商品数据失败:', error);
      setError(error.message || '加载失败');
      toast({
        title: '加载失败',
        description: '无法加载商品数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理SKU选择
  const handleSkuChange = sku => {
    setSelectedSku(sku);
  };

  // 处理数量变化
  const handleQuantityChange = delta => {
    const newQuantity = Math.max(1, Math.min(selectedSku?.stock || product?.stock || 1, quantity + delta));
    setQuantity(newQuantity);
  };

  // 处理收藏
  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? '取消收藏' : '收藏成功',
      description: isFavorite ? '已从收藏夹移除' : '已添加到收藏夹',
      variant: 'default'
    });
  };

  // 处理加入购物车
  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
      product_id: productId,
      product_name: product.name,
      price: selectedSku?.price || product.price,
      quantity: quantity,
      image: product.image,
      specifications: selectedSku?.specifications || {},
      sku: selectedSku?.sku || ''
    };
    console.log('加入购物车:', cartItem);
    toast({
      title: '加入成功',
      description: '商品已添加到购物车',
      variant: 'default'
    });
  };

  // 处理立即购买
  const handleBuyNow = () => {
    if (!product) return;
    const orderItem = {
      product_id: productId,
      product_name: product.name,
      price: selectedSku?.price || product.price,
      quantity: quantity,
      image: product.image,
      specifications: selectedSku?.specifications || {},
      sku: selectedSku?.sku || ''
    };
    console.log('立即购买:', orderItem);
    // 跳转到订单确认页
    // $w.utils.navigateTo({ 
    //   pageId: 'orderConfirm', 
    //   params: { 
    //     items: [orderItem],
    //     totalPrice: orderItem.price * quantity
    //   } 
    // });
  };

  // 处理分享
  const handleShare = () => {
    console.log('分享商品:', productId);
    toast({
      title: '分享成功',
      description: '商品链接已复制',
      variant: 'default'
    });
  };

  // 初始加载
  useEffect(() => {
    loadProductData();
  }, [productId]);

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return <div className="space-y-4">
          <div className="h-80 bg-gray-200 animate-pulse"></div>
          <div className="px-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>;
    }
    if (error) {
      return <ErrorState message={error} onRetry={loadProductData} />;
    }
    if (!product) {
      return <EmptyState />;
    }
    return <div>
        {/* 商品图片 */}
        <ProductImageGallery images={detail?.images || [product.image]} />

        {/* 商品信息 */}
        <ProductInfo product={product} detail={detail} />

        {/* 规格选择 */}
        {detail?.sku_list && detail.sku_list.length > 0 && <SpecificationSelector skuList={detail.sku_list} attributes={detail.attributes || []} onSkuChange={handleSkuChange} />}

        {/* 数量选择 */}
        <div className="px-4 py-4 bg-white mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">数量</span>
            <div className="flex items-center">
              <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-sm">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} disabled={quantity >= (selectedSku?.stock || product.stock)} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50">
                <Plus size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">库存: {selectedSku?.stock || product.stock}件</p>
        </div>

        {/* 商品详情 */}
        <ProductDetails detail={detail} />

        {/* 用户评价 */}
        <ProductReviews reviewsCount={detail?.reviews_count} rating={detail?.rating} />
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 返回按钮 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => $w.utils.navigateBack()} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-medium ml-2">商品详情</h1>
          <div className="ml-auto flex items-center space-x-4">
            <button onClick={handleFavorite} className="p-2">
              <Heart size={20} className={`${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </button>
            <button onClick={handleShare} className="p-2">
              <Share2 size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="pt-14">
        {renderContent()}
      </div>

      {/* 底部操作栏 */}
      <ActionBar product={product} selectedSku={selectedSku} quantity={quantity} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </div>;
}