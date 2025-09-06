// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart, Trash2, Plus, Minus, RefreshCw, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { CartItem } from '@/components/CartItem';
// @ts-ignore;
import { CartSummary } from '@/components/CartSummary';
// @ts-ignore;
import { EmptyCart } from '@/components/EmptyCart';

// 数据加载Hook
const useCartData = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const {
    toast
  } = useToast();
  const loadCartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
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
          }]
        }
      });

      // 安全处理购物车数据
      const cartData = (res.records || []).map(item => ({
        id: item._id,
        productId: item.productId,
        quantity: item.quantity || 1,
        sku: item.sku || {},
        createdAt: item.createdAt
      }));
      setCartItems(cartData);
    } catch (err) {
      setError(err.message);
      toast({
        title: '购物车加载失败',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  const updateQuantity = useCallback(async (cartId, newQuantity) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            quantity: newQuantity
          },
          filter: {
            where: {
              _id: {
                $eq: cartId
              }
            }
          }
        }
      });
      await loadCartData();
    } catch (err) {
      toast({
        title: '更新失败',
        description: err.message,
        variant: 'destructive'
      });
    }
  }, [loadCartData, toast]);
  const removeItem = useCallback(async cartId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: cartId
              }
            }
          }
        }
      });
      await loadCartData();
      toast({
        title: '已移除商品'
      });
    } catch (err) {
      toast({
        title: '移除失败',
        description: err.message,
        variant: 'destructive'
      });
    }
  }, [loadCartData, toast]);
  return {
    cartItems,
    loading,
    error,
    selectedItems,
    setSelectedItems,
    loadCartData,
    updateQuantity,
    removeItem
  };
};

// 骨架屏组件
const CartSkeleton = () => <div className="space-y-4 p-4">
    {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>)}
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
export default function Cart(props) {
  const {
    $w
  } = props;
  const {
    cartItems,
    loading,
    error,
    selectedItems,
    setSelectedItems,
    loadCartData,
    updateQuantity,
    removeItem
  } = useCartData();

  // 页面加载
  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  // 计算选中商品总价
  const totalPrice = cartItems.filter(item => selectedItems.includes(item.id)).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  // 渲染购物车内容
  const renderCartContent = () => {
    if (loading) {
      return <CartSkeleton />;
    }
    if (error) {
      return <ErrorState message={error} onRetry={loadCartData} />;
    }
    if (cartItems.length === 0) {
      return <EmptyCart onShopNow={() => $w.utils.navigateTo({
        pageId: 'home'
      })} />;
    }
    return <div className="space-y-4">
        {cartItems.map(item => <CartItem key={item.id} item={item} selected={selectedItems.includes(item.id)} onSelect={() => {
        const newSelected = selectedItems.includes(item.id) ? selectedItems.filter(id => id !== item.id) : [...selectedItems, item.id];
        setSelectedItems(newSelected);
      }} onQuantityChange={newQuantity => updateQuantity(item.id, newQuantity)} onRemove={() => removeItem(item.id)} />)}
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4">
        {renderCartContent()}
      </div>
      {cartItems.length > 0 && <CartSummary totalPrice={totalPrice} selectedCount={selectedItems.length} onCheckout={() => $w.utils.navigateTo({
      pageId: 'payment',
      params: {
        cartItems: cartItems.filter(item => selectedItems.includes(item.id))
      }
    })} />}
    </div>;
}