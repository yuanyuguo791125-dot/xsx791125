// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';

// 订单状态配置
const ORDER_STATUS_CONFIG = {
  pending: {
    label: '待付款',
    color: 'warning',
    icon: Clock
  },
  paid: {
    label: '待发货',
    color: 'info',
    icon: Package
  },
  shipped: {
    label: '待收货',
    color: 'primary',
    icon: Truck
  },
  completed: {
    label: '已完成',
    color: 'success',
    icon: CheckCircle
  },
  cancelled: {
    label: '已取消',
    color: 'destructive',
    icon: XCircle
  }
};

// 图片路径处理
const processImageUrl = url => {
  if (!url) return 'https://via.placeholder.com/80x80?text=No+Image';
  if (url.startsWith('cloud://')) {
    return url.replace('cloud://', 'https://your-cdn.com/');
  }
  if (url.startsWith('/')) {
    return `https://your-cdn.com${url}`;
  }
  return url;
};
export function OrderCard({
  order,
  onClick
}) {
  if (!order) return null;

  // 安全处理订单数据
  const safeOrder = {
    _id: order._id || '',
    orderNo: order.orderNo || '',
    status: order.status || 'pending',
    createdAt: order.createdAt || new Date().toISOString(),
    totalAmount: order.totalAmount || 0,
    items: Array.isArray(order.items) ? order.items : []
  };
  const statusConfig = ORDER_STATUS_CONFIG[safeOrder.status] || ORDER_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  // 计算商品总数
  const totalQuantity = safeOrder.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  return <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        {/* 订单头部 */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-500">订单号: {safeOrder.orderNo}</p>
            <p className="text-xs text-gray-400">
              {new Date(safeOrder.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>
        </div>

        {/* 商品列表 */}
        <div className="space-y-2 mb-3">
          {safeOrder.items.slice(0, 3).map((item, index) => {
          const safeItem = {
            name: item.name || '商品名称',
            image: item.image || '',
            quantity: item.quantity || 1,
            price: item.price || 0
          };
          return <div key={index} className="flex gap-3">
                <LazyImage src={processImageUrl(safeItem.image)} alt={safeItem.name} className="w-16 h-16 object-cover rounded" width={64} height={64} />
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-1">{safeItem.name}</h4>
                  <p className="text-xs text-gray-500">x{safeItem.quantity}</p>
                  <p className="text-sm font-bold text-red-600">¥{safeItem.price}</p>
                </div>
              </div>;
        })}
          
          {safeOrder.items.length > 3 && <p className="text-sm text-gray-500 text-center">
              还有 {safeOrder.items.length - 3} 件商品
            </p>}
        </div>

        {/* 订单底部 */}
        <div className="flex justify-between items-center pt-3 border-t">
          <div>
            <span className="text-sm text-gray-500">共{totalQuantity}件商品</span>
            <span className="ml-2 font-bold">¥{safeOrder.totalAmount}</span>
          </div>
          <Button variant="outline" size="sm">
            查看详情
          </Button>
        </div>
      </CardContent>
    </Card>;
}