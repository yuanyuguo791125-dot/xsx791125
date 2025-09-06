// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, TrendingDown, Gift, ShoppingBag } from 'lucide-react';

// 积分类型配置
const POINTS_TYPE_CONFIG = {
  earn: {
    label: '获得',
    color: 'success',
    icon: TrendingUp
  },
  spend: {
    label: '使用',
    color: 'destructive',
    icon: TrendingDown
  },
  refund: {
    label: '退回',
    color: 'info',
    icon: Gift
  },
  order: {
    label: '购物',
    color: 'primary',
    icon: ShoppingBag
  }
};
export function PointsHistory({
  data = [],
  loading = false,
  onLoadMore,
  hasMore = false
}) {
  if (loading && data.length === 0) {
    return <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </CardContent>
          </Card>)}
      </div>;
  }
  if (data.length === 0) {
    return <div className="text-center py-8">
        <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">暂无积分记录</p>
      </div>;
  }
  return <div className="space-y-3">
      {data.map((item, index) => {
      const config = POINTS_TYPE_CONFIG[item.type] || POINTS_TYPE_CONFIG.earn;
      const Icon = config.icon;
      return <Card key={item._id || index} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                <Icon className={`w-4 h-4 text-${config.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.description}</p>
                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <Badge variant={config.color} className={item.points > 0 ? 'text-green-600' : 'text-red-600'}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>;
    })}
      {hasMore && <div className="text-center pt-4">
        <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loading}>
          {loading ? '加载中...' : '加载更多'}
        </Button>
      </div>}
    </div>;
}