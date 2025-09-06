// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Users, Clock, RefreshCw, AlertCircle, Filter } from 'lucide-react';

// @ts-ignore;
import { GroupCard } from '@/components/GroupCard';
// @ts-ignore;
import { CategoryFilter } from '@/components/CategoryFilter';
// @ts-ignore;
import { CountdownTimer } from '@/components/CountdownTimer';

// 数据加载Hook
const useGroupData = () => {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {
    toast
  } = useToast();
  const loadCategories = useCallback(async () => {
    try {
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sortOrder: 'asc'
          }]
        }
      });
      const categoryData = (res.records || []).map(category => ({
        id: category._id,
        name: category.name || '分类名称',
        icon: category.icon || ''
      }));
      setCategories([{
        id: 'all',
        name: '全部',
        icon: '🏠'
      }, ...categoryData]);
    } catch (err) {
      console.error('分类加载失败:', err);
    }
  }, []);
  const loadGroups = useCallback(async (isRefresh = false) => {
    try {
      setLoading(true);
      const currentPage = isRefresh ? 1 : page;
      const filter = {
        where: {
          status: {
            $eq: 'active'
          },
          endTime: {
            $gte: new Date().getTime()
          }
        }
      };
      if (selectedCategory !== 'all') {
        filter.where.categoryId = {
          $eq: selectedCategory
        };
      }
      const res = await $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter,
          select: {
            $master: true
          },
          orderBy: [{
            sortOrder: 'asc'
          }, {
            createdAt: 'desc'
          }],
          pageNumber: currentPage,
          pageSize: 10,
          getCount: true
        }
      });
      const groupData = (res.records || []).map(group => ({
        id: group._id,
        title: group.title || '拼团活动',
        image: group.image || '',
        price: group.price || 0,
        originalPrice: group.originalPrice || 0,
        endTime: group.endTime || Date.now() + 3600000,
        participants: group.participants || 0,
        target: group.target || 2,
        categoryId: group.categoryId || 'all'
      }));
      if (isRefresh) {
        setGroups(groupData);
      } else {
        setGroups(prev => [...prev, ...groupData]);
      }
      setHasMore(groupData.length === 10 && currentPage * 10 < res.total);
      setPage(currentPage + 1);
    } catch (err) {
      setError(err.message);
      toast({
        title: '拼团加载失败',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory]);
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadGroups(true);
  }, [loadGroups]);
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadGroups();
    }
  }, [loading, hasMore, loadGroups]);
  return {
    groups,
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    hasMore,
    refresh,
    loadMore,
    loadCategories
  };
};

// 骨架屏组件
const GroupListSkeleton = () => <div className="space-y-4 p-4">
    {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-20" />
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
export default function GroupList(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('group');
  const {
    groups,
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    hasMore,
    refresh,
    loadMore,
    loadCategories
  } = useGroupData();

  // 页面加载
  useEffect(() => {
    loadCategories();
    refresh();
  }, [loadCategories, refresh]);

  // 分类切换
  useEffect(() => {
    refresh();
  }, [selectedCategory, refresh]);

  // 渲染拼团列表
  const renderGroupList = () => {
    if (loading && groups.length === 0) {
      return <GroupListSkeleton />;
    }
    if (error) {
      return <ErrorState message={error} onRetry={refresh} />;
    }
    if (groups.length === 0) {
      return <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无拼团活动</p>
        </div>;
    }
    return <div className="space-y-4">
        {groups.map(group => <GroupCard key={group.id} group={group} onClick={() => $w.utils.navigateTo({
        pageId: 'groupDetail',
        params: {
          groupId: group.id
        }
      })} />)}
        {hasMore && <div className="text-center py-4">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? '加载中...' : '加载更多'}
          </Button>
        </div>}
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4">
        {/* 分类筛选 */}
        <CategoryFilter categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        {/* 拼团列表 */}
        {renderGroupList()}
      </div>
    </div>;
}