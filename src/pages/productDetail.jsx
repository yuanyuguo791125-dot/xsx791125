// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, Package } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { ImageGallery } from '@/components/ImageGallery';
// @ts-ignore;
import { ActionBar } from '@/components/ActionBar';
const ProductInfo = memo(({
  product
}) => {
  return <div className="space-y-4">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
        </div>
        <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount}条评价)</span>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-red-600">¥{product.price}</span>
          <span className="text-sm text-gray-500 line-through">¥{product.originalPrice}</span>
          <Badge variant="destructive">{product.discount}折</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-green-600" />
          <span>正品保障</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>全场包邮</span>
        </div>
      </div>
    </div>;
});
export default function ProductDetail(props) {
  const {
    $w
  } = props;
  const productId = $w.page.dataset.params.productId;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const {
    toast
  } = useToast();
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'product_detail',
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
      });
      setProduct(result);
    } catch (error) {
      toast({
        title: "获取商品详情失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [productId]);
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);
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
            selected: true
          }
        }
      });
      toast({
        title: "添加成功",
        description: `已添加到购物车 (${quantity}件)`
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [productId, quantity]);
  const handleBuyNow = useCallback(() => {
    // 立即购买逻辑
    $w.utils.navigateTo({
      pageId: 'cart'
    });
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">商品不存在</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <ImageGallery images={product.images || [product.image]} selectedIndex={selectedImage} onSelect={setSelectedImage} />
        
        <div className="p-4">
          <ProductInfo product={product} />
        </div>
      </div>
      
      <ActionBar quantity={quantity} onQuantityChange={setQuantity} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </div>;
}