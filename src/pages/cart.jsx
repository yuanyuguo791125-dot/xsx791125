// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart, Package, CreditCard } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar.jsx';
import { CartItem } from '@/components/CartItem.jsx';
import { CartSummary } from '@/components/CartSummary.jsx';

// 购物车商品项组件
function CartItemComponent({
  item,
  onQuantityChange,
  onSelectChange,
  onDelete,
  onProductClick
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 加载商品详情
  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'product',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: item.product_id
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        setProduct(result);
      }
    } catch (error) {
      console.error('加载商品详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProductDetail();
  }, [item.product_id]);
  const handleQuantityChange = delta => {
    const newQuantity = Math.max(1, Math.min(product?.stock || item.stock, item.quantity + delta));
    onQuantityChange(item._id, newQuantity);
  };
  const handleSelectChange = () => {
    onSelectChange(item._id, !item.is_selected);
  };
  const handleDelete = () => {
    onDelete(item._id);
  };
  const handleProductClick = () => {
    onProductClick(item.product_id);
  };
  if (loading) {
    return <div className="flex items-center p-4 bg-white mb-2 animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded"></div>
        <div className="flex-1 ml-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>;
  }
  return <div className="flex items-center p-4 bg-white mb-2">
      <input type="checkbox" checked={item.is_selected} onChange={handleSelectChange} className="mr-3 w-5 h-5 text-orange-600 rounded" />
      <img src={item.image || product?.image} alt={item.product_name} className="w-20 h-20 rounded object-cover" onClick={handleProductClick} />
      <div className="flex-1 ml-3">
        <h3 className="text-sm font-medium text-gray-900 mb-1" onClick={handleProductClick}>{item.product_name}</h3>
        {item.specifications && <p className="text-xs text-gray-500 mb-1">{JSON.stringify(item.specifications)}</p>}
        <p className="text-sm text-orange-600 font-bold">¥{item.price}</p>
        <div className="flex items-center mt-2">
          <button onClick={() => handleQuantityChange(-1)} disabled={item.quantity <= 1} className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50">
            <Minus size={12} />
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button onClick={() => handleQuantityChange(1)} disabled={item.quantity >= (product?.stock || item.stock)} className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50">
            <Plus size={12} />
          </button>
          <span className="ml-2 text-xs text-gray-500">库存: {product?.stock || item.stock}</span>
        </div>
      </div>
      <button onClick={handleDelete} className="text-red-500">
        <Trash2 size={16} />
      </button>
    </div>;
}

// 购物车汇总组件
function CartSummaryComponent({
  items,
  onCheckout
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  useEffect(() => {
    const selected = items.filter(item => item.is_selected);
    setSelectedItems(selected);
    const total = selected.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const quantity = selected.reduce((sum, item) => sum + item.quantity, 0);
    setTotalPrice(total);
    setTotalQuantity(quantity);
  }, [items]);
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return;
    }
    onCheckout(selectedItems, totalPrice);
  };
  return <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">已选 {selectedItems.length} 件商品</p>
          <p className="text-lg font-bold text-orange-600">合计: ¥{totalPrice.toFixed(2)}</p>
        </div>
        <button onClick={handleCheckout} disabled={selectedItems.length === 0} className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm disabled:opacity-50">
          结算 ({totalQuantity})
        </button>
      </div>
    </div>;
}

// 空购物车组件
function EmptyCart() {
  return <div className="flex flex-col items-center justify-center py-20">
      <ShoppingCart size={64} className="text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-2">购物车是空的</p>
      <p className="text-gray-400 text-sm mb-6">快去挑选心仪的商品吧</p>
      <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm">
        去逛逛
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
export default function CartPage(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('cart');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const {
    toast
  } = useToast();

  // 加载购物车数据
  const loadCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = $w.auth.currentUser;
      if (!currentUser) {
        setCartItems([]);
        return;
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: currentUser.userId
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            created_at: 'desc'
          }]
        }
      });
      if (result.records) {
        setCartItems(result.records);
        // 检查是否全选
        const allSelected = result.records.every(item => item.is_selected);
        setSelectAll(allSelected);
      }
    } catch (error) {
      console.error('加载购物车数据失败:', error);
      setError(error.message || '加载失败');
      toast({
        title: '加载失败',
        description: '无法加载购物车数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新购物车商品数量
  const updateQuantity = async (itemId, newQuantity) => {
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
                $eq: itemId
              }
            }
          }
        }
      });
      setCartItems(prev => prev.map(item => item._id === itemId ? {
        ...item,
        quantity: newQuantity
      } : item));
    } catch (error) {
      console.error('更新数量失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 更新商品选择状态
  const updateSelection = async (itemId, isSelected) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            is_selected: isSelected
          },
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
        is_selected: isSelected
      } : item));
    } catch (error) {
      console.error('更新选择状态失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 删除购物车商品
  const deleteItem = async itemId => {
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
      toast({
        title: '删除成功',
        description: '商品已从购物车移除',
        variant: 'default'
      });
    } catch (error) {
      console.error('删除商品失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 全选/取消全选
  const toggleSelectAll = async () => {
    const newSelectAll = !selectAll;
    try {
      const currentUser = $w.auth.currentUser;
      if (!currentUser) return;
      await $w.cloud.callDataSource({
        dataSourceName: 'shopping_cart',
        methodName: 'wedaBatchUpdateV2',
        params: {
          data: {
            is_selected: newSelectAll
          },
          filter: {
            where: {
              user_id: {
                $eq: currentUser.userId
              }
            }
          }
        }
      });
      setCartItems(prev => prev.map(item => ({
        ...item,
        is_selected: newSelectAll
      })));
      setSelectAll(newSelectAll);
    } catch (error) {
      console.error('全选操作失败:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 结算
  const handleCheckout = (selectedItems, totalPrice) => {
    if (selectedItems.length === 0) {
      toast({
        title: '提示',
        description: '请选择要结算的商品',
        variant: 'default'
      });
      return;
    }
    console.log('结算商品:', selectedItems, '总价:', totalPrice);
    // 跳转到订单确认页
    // $w.utils.navigateTo({ 
    //   pageId: 'orderConfirm', 
    //   params: { 
    //     items: selectedItems,
    //     totalPrice: totalPrice
    //   } 
    // });
  };

  // 跳转到商品详情
  const handleProductClick = productId => {
    // $w.utils.navigateTo({ 
    //   pageId: 'productDetail', 
    //   params: { id: productId } 
    // });
  };

  // 初始加载
  useEffect(() => {
    loadCartData();
  }, []);

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return <div className="space-y-4">
          <div className="px-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="flex items-center p-4 bg-white animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 ml-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>)}
            </div>
          </div>
        </div>;
    }
    if (error) {
      return <ErrorState message={error} onRetry={loadCartData} />;
    }
    if (cartItems.length === 0) {
      return <EmptyCart />;
    }
    return <div>
        {/* 购物车头部 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
          <h1 className="text-lg font-medium">购物车 ({cartItems.length})</h1>
          <div className="flex items-center">
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="mr-2 w-4 h-4 text-orange-600 rounded" />
            <span className="text-sm">全选</span>
          </div>
        </div>

        {/* 购物车商品列表 */}
        <div className="pb-20">
          {cartItems.map(item => <CartItemComponent key={item._id} item={item} onQuantityChange={updateQuantity} onSelectChange={updateSelection} onDelete={deleteItem} onProductClick={handleProductClick} />)}
        </div>

        {/* 购物车汇总 */}
        <CartSummaryComponent items={cartItems} onCheckout={handleCheckout} />
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 返回按钮 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => $w.utils.navigateBack()} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-medium ml-2">购物车</h1>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="pt-14">
        {renderContent()}
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}