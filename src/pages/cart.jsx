// @ts-ignore;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Checkbox, useToast } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart, Trash2 } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
// @ts-ignore;
import { VirtualizedList } from '@/components/VirtualizedList';
// @ts-ignore;
import { CartItemCard } from '@/components/CartItemCard';
// @ts-ignore;
import { EmptyCart } from '@/components/EmptyCart';
// @ts-ignore;
import { CartSummary } from '@/components/CartSummary';
export default function Cart(props) {
  const {
    $w
  } = props;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [updating, setUpdating] = useState(false);
  const {
    toast
  } = useToast();

  // 防抖处理
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
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
          orderBy: [{
            createdAt: 'desc'
          }],
          select: {
            $master: true
          }
        }
      });
      setCartItems(result.records || []);
    } catch (error) {
      toast({
        title: "获取购物车失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 更新购物车商品
  const updateCartItem = useCallback(async (itemId, updates) => {
    try {
      setUpdating(true);
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaUpdateV2',
        params: {
          data: updates,
          filter: {
            where: {
              _id: {
                $eq: itemId
              }
            }
          }
        }
      });
      setCartItems(prev => prev.map(item => item._id === itemId ? {
        ...item,
        ...updates
      } : item));
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  }, []);

  // 删除购物车商品
  const removeCartItem = useCallback(async itemId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: itemId
              }
            }
          }
        }
      });
      setCartItems(prev => prev.filter(item => item._id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      toast({
        title: "删除成功",
        description: "商品已从购物车移除"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  }, []);

  // 批量删除
  const handleBatchDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaBatchDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $in: selectedItems
              }
            }
          }
        }
      });
      setCartItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
      setSelectedItems([]);
      setSelectAll(false);
      toast({
        title: "批量删除成功",
        description: `已删除 ${selectedItems.length} 件商品`
      });
    } catch (error) {
      toast({
        title: "批量删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [selectedItems]);

  // 选择/取消选择商品
  const handleSelectItem = useCallback((itemId, checked) => {
    setSelectedItems(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback(checked => {
    setSelectAll(checked);
    setSelectedItems(checked ? cartItems.map(item => item._id) : []);
  }, [cartItems]);

  // 防抖计算总金额
  const debouncedTotalAmount = useMemo(() => {
    const selectedItemsData = cartItems.filter(item => selectedItems.includes(item._id));
    return selectedItemsData.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems, selectedItems]);

  // 去结算
  const handleCheckout = useCallback(() => {
    if (selectedItems.length === 0) {
      toast({
        title: "请选择商品",
        description: "请先选择要结算的商品",
        variant: "destructive"
      });
      return;
    }
    const selectedItemsData = cartItems.filter(item => selectedItems.includes(item._id));
    $w.utils.navigateTo({
      pageId: 'orderConfirm',
      params: {
        items: JSON.stringify(selectedItemsData),
        totalAmount: debouncedTotalAmount
      }
    });
  }, [selectedItems, cartItems, debouncedTotalAmount]);

  // 返回购物
  const handleNavigateToHome = useCallback(() => {
    $w.utils.navigateTo({
      pageId: 'home'
    });
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="cart" count={3} />
      </div>;
  }
  if (cartItems.length === 0) {
    return <div className="min-h-screen bg-gray-50">
        <EmptyCart onNavigate={handleNavigateToHome} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="p-4 pb-32">
        {/* 顶部操作栏 */}
        <Card className="mb-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
              <span className="text-sm font-medium">全选</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBatchDelete} disabled={selectedItems.length === 0} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-1" />
              批量删除
            </Button>
          </CardContent>
        </Card>

        {/* 购物车商品列表 */}
        <VirtualizedList items={cartItems} renderItem={item => <CartItemCard item={item} onUpdate={updateCartItem} onRemove={removeCartItem} onSelect={handleSelectItem} isSelected={selectedItems.includes(item._id)} />} itemHeight={140} className="h-[calc(100vh-300px)]" />

        {/* 加载状态 */}
        {updating && <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>}
      </div>

      {/* 结算栏 */}
      <CartSummary items={cartItems} selectedItems={selectedItems} onCheckout={handleCheckout} onBatchDelete={handleBatchDelete} />
    </div>;
}