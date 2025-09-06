// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Checkbox } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

// @ts-ignore;
import CartItem from '@/components/CartItem';
// @ts-ignore;
import CartSummary from '@/components/CartSummary';
// @ts-ignore;
import EmptyCart from '@/components/EmptyCart';
// @ts-ignore;
import TabBar from '@/components/TabBar';

// 购物车数据Hook
const useCartData = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadCartData = async () => {
    try {
      setLoading(true);

      // 获取当前用户ID
      const userId = $w.auth.currentUser?.userId || 'guest';

      // 从数据源获取购物车数据
      const cartRes = await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          orderBy: [{
            updatedAt: 'desc'
          }],
          select: {
            $master: true
          }
        }
      });
      setCartItems(cartRes.records || []);
      setSelectedItems(cartRes.records?.map(item => item._id) || []);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const updateCartItem = async (itemId, updates) => {
    try {
      // 调用云函数更新购物车
      const result = await $w.cloud.callFunction({
        name: 'updateCart',
        data: {
          cartId: itemId,
          ...updates,
          userId: $w.auth.currentUser?.userId || 'guest'
        }
      });
      if (result.success) {
        // 本地更新数据
        setCartItems(prev => prev.map(item => item._id === itemId ? {
          ...item,
          ...updates
        } : item));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      // 降级处理：直接更新数据源
      try {
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

        // 重新加载数据
        await loadCartData();
      } catch (dataError) {
        toast({
          title: '更新失败',
          description: dataError.message,
          variant: 'destructive'
        });
      }
    }
  };
  const removeCartItem = async itemId => {
    try {
      // 直接删除数据源中的记录
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

      // 更新本地状态
      setCartItems(prev => prev.filter(item => item._id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      toast({
        title: '删除成功',
        description: '商品已从购物车移除'
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const toggleItemSelection = itemId => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };
  const selectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item._id));
    }
  };
  const calculateTotal = () => {
    return cartItems.filter(item => selectedItems.includes(item._id)).reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const calculateSelectedCount = () => {
    return selectedItems.length;
  };
  return {
    cartItems,
    selectedItems,
    loading,
    loadCartData,
    updateCartItem,
    removeCartItem,
    toggleItemSelection,
    selectAll,
    calculateTotal,
    calculateSelectedCount
  };
};
export default function Cart(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('cart');
  const {
    cartItems,
    selectedItems,
    loading,
    loadCartData,
    updateCartItem,
    removeCartItem,
    toggleItemSelection,
    selectAll,
    calculateTotal,
    calculateSelectedCount
  } = useCartData();
  useEffect(() => {
    loadCartData();
  }, [loadCartData]);
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems.find(item => item._id === itemId);
    if (newQuantity > item.stock) {
      // 显示库存不足提示
      return;
    }
    await updateCartItem(itemId, {
      quantity: newQuantity
    });
  };
  const handleRemoveItem = async itemId => {
    await removeCartItem(itemId);
  };
  const handleCheckout = () => {
    const selectedProducts = cartItems.filter(item => selectedItems.includes(item._id));
    if (selectedProducts.length === 0) {
      // 显示请选择商品的提示
      return;
    }
    $w.utils.navigateTo({
      pageId: 'payment',
      params: {
        items: selectedProducts.map(item => ({
          productId: item.product_id,
          skuId: item.sku,
          name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          cartId: item._id
        })),
        totalAmount: calculateTotal()
      }
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded mb-4" />)}
          </div>
        </div>
      </div>;
  }
  if (cartItems.length === 0) {
    return <div className="min-h-screen bg-gray-50">
        <EmptyCart onBrowse={() => $w.utils.navigateTo({
        pageId: 'home'
      })} />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-lg font-bold text-center">购物车</h1>
      </div>

      {/* 全选 */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox checked={selectedItems.length === cartItems.length && cartItems.length > 0} onCheckedChange={selectAll} />
            <span className="ml-2 text-sm">全选 ({cartItems.length})</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
          // 批量删除未选中的商品
          const unselectedItems = cartItems.filter(item => !selectedItems.includes(item._id));
          unselectedItems.forEach(item => handleRemoveItem(item._id));
        }}>
            清理
          </Button>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="space-y-4 p-4">
        {cartItems.map(item => <CartItem key={item._id} item={item} isSelected={selectedItems.includes(item._id)} onSelectionChange={() => toggleItemSelection(item._id)} onQuantityChange={newQuantity => handleQuantityChange(item._id, newQuantity)} onRemove={() => handleRemoveItem(item._id)} />)}
      </div>

      {/* 结算栏 */}
      <CartSummary totalAmount={calculateTotal()} selectedCount={calculateSelectedCount()} onCheckout={handleCheckout} />

      {/* 底部导航 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}