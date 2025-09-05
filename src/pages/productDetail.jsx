// @ts-ignore;
import React, { useState, useEffect, useCallback, memo } from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, Package } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
const ImageGallery = memo(({
  images,
  selectedIndex,
  onSelect
}) => {
  return <div className="space-y-4">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <LazyImage src={images[selectedIndex]} alt="商品图片" className="w-full h-full object-cover" />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((image, index) => <div key={index} className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer ${index === selectedIndex ? 'ring-2 ring-blue-500' : ''}`} onClick={() => onSelect(index)}>
            <LazyImage src={image} alt={`缩略图 ${index + 1}`} className="w-full h-full object-cover" />
          </div>)}
      </div>
    </div>;
});
const ActionBar = memo(({
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow
}) => {
  return <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>
            -
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button variant="outline" size="sm" onClick={() => onQuantityChange(quantity + 1)}>
            +
          </Button>
        </div>
        <Button className="flex-1" onClick={onAddToCart} size="sm">
          <ShoppingCart className="w-4 h-4 mr-2" />
          加入购物车
        </Button>
        <Button variant="destructive" className="flex-1" onClick={onBuyNow} size="sm">
          立即购买
        </Button>
      </div>
    </div>;
});
export default function ProductDetail(props) {
  const {
    $w
  } = props;
  const productId = $w.page.dataset.params.productId;
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
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
      const [productResult, inventoryResult] = await Promise.all([$w.cloud.callDataSource({
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
      setProduct(productResult);
      setInventory(inventoryResult);
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
    if (!product || !inventory || inventory.stock < quantity) {
      toast({
        title: "库存不足",
        description: "商品库存不足",
        variant: "destructive"
      });
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: $w.auth.currentUser?.userId || 'demo_user',
            productId: product._id,
            productName: product.name,
            productImage: product.images?.[0] || product.image,
            price: product.price,
            quantity: quantity,
            selected: true,
            stock: inventory.stock
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
  }, [product, inventory, quantity]);
  const handleBuyNow = useCallback(() => {
    if (!product) return;
    $w.utils.navigateTo({
      pageId: 'orderConfirm',
      params: {
        productId: product._id,
        quantity: quantity
      }
    });
  }, [product, quantity]);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="productDetail" />
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
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
            </div>
            <span className="text-sm text-gray-600">{product.rating || 0} ({product.reviewCount || 0}条评价)</span>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">¥{product.price}</span>
              {product.originalPrice && <span className="text-sm text-gray-500 line-through">¥{product.originalPrice}</span>}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>正品保障</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>全场包邮</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">商品详情</h3>
              <p className="text-sm text-gray-600">{product.description || '暂无商品描述'}</p>
            </div>
            
            {inventory && <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">库存：</span>
                  {inventory.stock > 0 ? `${inventory.stock}件` : '暂时缺货'}
                </p>
              </div>}
          </div>
        </div>
      </div>
      
      <ActionBar quantity={quantity} onQuantityChange={setQuantity} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </div>;
}