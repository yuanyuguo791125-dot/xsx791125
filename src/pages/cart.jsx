// @ts-ignore;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Checkbox, useToast } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart } from 'lucide-react';

// @ts-ignore;
import { CartItemCard } from '@/components/CartItemCard';
// @ts-ignore;
import { CartSummary } from '@/components/CartSummary';
// @ts-ignore;
import { EmptyCart } from '@/components/EmptyCart';
// @ts-ignore;
import { SkeletonLoader } from '@/components/SkeletonLoader';
export default function Cart(props) {
  const {
    $w
  } = props;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const {
    toast
  } = useToast();

  // 缓存计算结果
  const cartCache = useMemo(() => ({
    items: cartItems,
    selected: selectedItems
  }), [cartItems, selectedItems]);
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
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      const items = result.records || [];
      setCartItems(items);

      // 默认全选
      if (items.length > 0) {
        const allIds = items.map(item => item._id);
        setSelectedItems(allIds);
        setSelectAll(true);
      }
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

  // 批量更新商品状态
  const handleUpdateItems = useCallback(async updates => {
    const updatePromises = updates.map(({
      id,
      data
    }) => $w.cloud.callDataSource({
      dataSourceName: 'shopping_cart',
      methodName: 'wedaUpdateV2',
      params: {
        data,
        filter: {
          where: {
            _id: {
              $eq: id
            }
          }
        }
      }
    }));
    try {
      await Promise.all(updatePromises);
      setCartItems(prev => prev.map(item => {
        const update = updates.find(u => u.id === item._id);
        return update ? {
          ...item,
          ...update.data
        } : item;
      }));
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  }, []);

  // 单个商品更新
  const handleUpdateItem = useCallback(async (id, data) => {
    setUpdatingItems(prev => new Set(prev).add(id));
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaUpdateV2',
        params: {
          data,
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      setCartItems(prev => prev.map(item => item._id === id ? {
        ...item,
        ...data
      } : item));
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);

  // 删除商品
  const handleRemoveItem = useCallback(async id => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      setCartItems(prev => prev.filter(item => item._id !== id));
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
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
  const handleBatchRemove = useCallback(async () => {
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
        title: "删除成功",
        description: `已删除${selectedItems.length}件商品`
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [selectedItems]);

  // 选择商品
  const handleSelectItem = useCallback((id, checked) => {
    setSelectedItems(prev => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter(itemId => itemId !== id);
      }
    });
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback(checked => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(cartItems.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  }, [cartItems]);

  // 监听全选状态
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectAll(selectedItems.length === cartItems.length);
    }
  }, [selectedItems, cartItems]);

  // 结算
  const handleCheckout = useCallback(() => {
    if (selectedItems.length === 0) {
      toast({
        title: "请选择商品",
        description: "请先选择要结算的商品",
        variant: "destructive"
      });
      return;
    }
    const selectedProducts = cartItems.filter(item => selectedItems.includes(item._id));
    $w.utils.navigateTo({
      pageId: 'orderConfirm',
      params: {
        items: JSON.stringify(selectedProducts)
      }
    });
  }, [selectedItems, cartItems]);

  // 浏览商品
  const handleBrowse = useCallback(() => {
    $w.utils.navigateTo({
      pageId: 'home'
    });
  }, []);

  // 计算总价
  const totalPrice = useMemo(() => {
    return cartItems.filter(item => selectedItems.includes(item._id)).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems, selectedItems]);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <SkeletonLoader type="cart" />
      </div>;
  }
  if (cartItems.length === 0) {
    return <EmptyCart onBrowse={handleBrowse} />;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white z-10 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">购物车 ({cartItems.length})</h1>
          {selectedItems.length > 0 && <Button variant="ghost" size="sm" onClick={handleBatchRemove} className="text-red-600">
              删除选中
            </Button>}
        </div>
      </div>

      <div className="p-4 pb-32">
        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg">
          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
          <span className="text-sm font-medium">全选</span>
          <span className="text-sm text-gray-500 ml-auto">
            已选 {selectedItems.length} 件商品
          </span>
        </div>

        {cartItems.map(item => <CartItemCard key={item._id} item={item} onUpdate={handleUpdateItem} onRemove={handleRemoveItem} onSelect={handleSelectItem} />)}
      </div>

      <CartSummary items={cartItems} selectedItems={selectedItems} onCheckout={handleCheckout} />
    </div>;
}