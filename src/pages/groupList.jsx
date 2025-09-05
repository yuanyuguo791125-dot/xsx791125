// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Search, Filter, Clock, Users, Package, TrendingUp } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar.jsx';
import { GroupCard } from '@/components/GroupCard.jsx';
import { CategoryFilter } from '@/components/CategoryFilter.jsx';

// 搜索栏组件
function SearchBar({
  onSearch,
  placeholder = "搜索拼团活动"
}) {
  const [searchValue, setSearchValue] = useState('');
  return <div className="px-4 py-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder={placeholder} value={searchValue} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={e => setSearchValue(e.target.value)} onKeyPress={e => {
        if (e.key === 'Enter') {
          onSearch(searchValue);
        }
      }} />
      </div>
    </div>;
}

// 排序筛选组件
function SortFilter({
  currentSort,
  onSortChange
}) {
  const sortOptions = [{
    value: 'hot',
    label: '热门',
    icon: TrendingUp
  }, {
    value: 'price_asc',
    label: '价格升序',
    icon: Package
  }, {
    value: 'price_desc',
    label: '价格降序',
    icon: Package
  }, {
    value: 'time',
    label: '即将结束',
    icon: Clock
  }];
  return <div className="flex items-center px-4 py-3 bg-white border-b">
      {sortOptions.map(option => <button key={option.value} onClick={() => onSortChange(option.value)} className={`flex items-center px-3 py-1 mr-2 text-sm rounded-full ${currentSort === option.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <option.icon size={14} className="mr-1" />
          {option.label}
        </button>)}
    </div>;
}

// 拼团列表组件
function GroupList({
  groups,
  loading,
  onGroupClick,
  onLoadMore,
  hasMore
}) {
  if (loading && groups.length === 0) {
    return <div className="px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>)}
        </div>
      </div>;
  }
  if (!loading && groups.length === 0) {
    return <div className="flex flex-col items-center justify-center py-20">
        <Package size={64} className="text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg mb-2">暂无拼团活动</p>
        <p className="text-gray-400 text-sm mb-6">当前没有进行中的拼团活动</p>
      </div>;
  }
  return <div className="px-4 py-6">
      <div className="space-y-4">
        {groups.map(group => <GroupCard key={group._id} group={group} onClick={() => onGroupClick(group._id)} />)}
      </div>
      {hasMore && <div className="text-center mt-6">
          <button onClick={onLoadMore} className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm">
            加载更多
          </button>
        </div>}
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
export default function GroupListPage(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSort, setCurrentSort] = useState('hot');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const {
    toast
  } = useToast();

  // 每页数量
  const pageSize = 10;

  // 加载分类数据
  const loadCategories = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'product_category',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_active: true
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            sort_order: 'asc'
          }]
        }
      });
      if (result.records) {
        setCategories([{
          _id: 'all',
          name: '全部',
          icon: 'grid',
          color: '#FF6B35'
        }, ...result.records]);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  // 加载拼团数据
  const loadGroups = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }
      setError(null);

      // 构建查询条件
      const filter = {
        where: {
          status: 'active'
        }
      };

      // 添加分类筛选
      if (selectedCategory !== 'all') {
        filter.where.category_id = {
          $eq: selectedCategory
        };
      }

      // 添加搜索关键词
      if (searchKeyword) {
        filter.where.title = {
          $search: searchKeyword
        };
      }

      // 构建排序
      const orderBy = [];
      switch (currentSort) {
        case 'hot':
          orderBy.push({
            participants: 'desc'
          });
          break;
        case 'price_asc':
          orderBy.push({
            price: 'asc'
          });
          break;
        case 'price_desc':
          orderBy.push({
            price: 'desc'
          });
          break;
        case 'time':
          orderBy.push({
            end_time: 'asc'
          });
          break;
        default:
          orderBy.push({
            createdAt: 'desc'
          });
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter,
          select: {
            $master: true
          },
          orderBy,
          pageSize,
          pageNumber: page,
          getCount: true
        }
      });
      if (result.records) {
        if (isLoadMore) {
          setGroups(prev => [...prev, ...result.records]);
        } else {
          setGroups(result.records);
        }
        setTotal(result.total || 0);
        setHasMore(result.records.length === pageSize);
      }
    } catch (error) {
      console.error('加载拼团数据失败:', error);
      setError(error.message || '加载失败');
      toast({
        title: '加载失败',
        description: '无法加载拼团数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = keyword => {
    setSearchKeyword(keyword);
    setPage(1);
    setGroups([]);
  };

  // 处理分类筛选
  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId);
    setPage(1);
    setGroups([]);
  };

  // 处理排序
  const handleSortChange = sort => {
    setCurrentSort(sort);
    setPage(1);
    setGroups([]);
  };

  // 处理加载更多
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // 处理拼团点击
  const handleGroupClick = groupId => {
    console.log('点击拼团:', groupId);
    // 跳转到拼团详情页
    // $w.utils.navigateTo({ 
    //   pageId: 'groupDetail', 
    //   params: { id: groupId } 
    // });
  };

  // 初始加载
  useEffect(() => {
    loadCategories();
  }, []);

  // 数据变化时重新加载
  useEffect(() => {
    loadGroups();
  }, [selectedCategory, currentSort, searchKeyword]);

  // 分页加载
  useEffect(() => {
    if (page > 1) {
      loadGroups(true);
    }
  }, [page]);

  // 渲染内容
  const renderContent = () => {
    if (loading && groups.length === 0) {
      return <div className="space-y-4">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="px-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>)}
            </div>
          </div>
        </div>;
    }
    return <div>
        {/* 搜索栏 */}
        <SearchBar onSearch={handleSearch} />

        {/* 分类筛选 */}
        <CategoryFilter categories={categories} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

        {/* 排序筛选 */}
        <SortFilter currentSort={currentSort} onSortChange={handleSortChange} />

        {/* 拼团列表 */}
        <GroupList groups={groups} loading={loading} onGroupClick={handleGroupClick} onLoadMore={handleLoadMore} hasMore={hasMore} />

        {/* 统计信息 */}
        {total > 0 && <div className="text-center py-4 text-sm text-gray-500">
            共 {total} 个拼团活动
          </div>}
      </div>;
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 返回按钮 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => $w.utils.navigateBack()} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-medium ml-2">拼团活动</h1>
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