// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
// @ts-ignore;
import { Users, Clock, TrendingUp, Fire, ChevronRight } from 'lucide-react';

// @ts-ignore;
import GroupCard from '@/components/GroupCard';
// @ts-ignore;
import CountdownTimer from '@/components/CountdownTimer';
// @ts-ignore;
import TabBar from '@/components/TabBar';

// 拼团数据Hook
const useGroupData = () => {
  const [groups, setGroups] = useState([]);
  const [hotGroups, setHotGroups] = useState([]);
  const [newGroups, setNewGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const loadGroupData = async () => {
    try {
      setLoading(true);

      // 获取所有拼团活动
      const groupRes = await $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              },
              end_time: {
                $gte: new Date().toISOString()
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
      setGroups(groupRes.records || []);

      // 获取热门拼团
      const hotRes = await $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              },
              is_hot: {
                $eq: true
              },
              end_time: {
                $gte: new Date().toISOString()
              }
            }
          },
          orderBy: [{
            participants: 'desc'
          }],
          pageSize: 6,
          select: {
            $master: true
          }
        }
      });
      setHotGroups(hotRes.records || []);

      // 获取新品拼团
      const newRes = await $w.cloud.callDataSource({
        dataSourceName: 'group_activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              },
              is_new: {
                $eq: true
              },
              end_time: {
                $gte: new Date().toISOString()
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 6,
          select: {
            $master: true
          }
        }
      });
      setNewGroups(newRes.records || []);
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
  return {
    groups,
    hotGroups,
    newGroups,
    loading,
    loadGroupData
  };
};

// 拼团分类标签
const GroupTabs = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [{
    key: 'all',
    label: '全部拼团',
    icon: Users
  }, {
    key: 'hot',
    label: '热门拼团',
    icon: Fire
  }, {
    key: 'new',
    label: '新品拼团',
    icon: TrendingUp
  }];
  return <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        {tabs.map(tab => <TabsTrigger key={tab.key} value={tab.key} className="text-sm">
            <tab.icon className="w-4 h-4 mr-1" />
            {tab.label}
          </TabsTrigger>)}
      </TabsList>
    </Tabs>;
};

// 拼团统计组件
const GroupStats = ({
  groups
}) => {
  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.status === 'active').length;
  const totalParticipants = groups.reduce((sum, g) => sum + (g.participants || 0), 0);
  return <Card className="mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{totalGroups}</p>
            <p className="text-xs text-gray-500">拼团总数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{activeGroups}</p>
            <p className="text-xs text-gray-500">进行中</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{totalParticipants}</p>
            <p className="text-xs text-gray-500">参与人数</p>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default function GroupList(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('all');
  const {
    groups,
    hotGroups,
    newGroups,
    loading,
    loadGroupData
  } = useGroupData();
  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);
  const handleGroupClick = groupId => {
    $w.utils.navigateTo({
      pageId: 'groupDetail',
      params: {
        groupId
      }
    });
  };
  const getCurrentGroups = () => {
    switch (activeTab) {
      case 'hot':
        return hotGroups;
      case 'new':
        return newGroups;
      default:
        return groups;
    }
  };
  const currentGroups = getCurrentGroups();
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 border-b">
          <h1 className="text-lg font-bold text-center">拼团活动</h1>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded" />)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-lg font-bold text-center">拼团活动</h1>
      </div>

      {/* 统计信息 */}
      <GroupStats groups={groups} />

      {/* 分类标签 */}
      <div className="bg-white border-b">
        <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 拼团列表 */}
      <div className="p-4">
        {currentGroups.length === 0 ? <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">暂无拼团活动</p>
            <p className="text-sm text-gray-400 mb-4">敬请期待更多精彩拼团</p>
          </div> : <div className="grid grid-cols-2 gap-4">
            {currentGroups.map(group => <GroupCard key={group._id} group={group} onClick={() => handleGroupClick(group._id)} />)}
          </div>}
      </div>

      {/* 底部导航 */}
      <TabBar activeTab="group" onTabChange={() => {}} />
    </div>;
}