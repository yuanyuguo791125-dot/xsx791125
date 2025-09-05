// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, LayoutGrid, Users, ShoppingCart, User } from 'lucide-react';

export function TabBar({
  activeTab,
  onTabChange
}) {
  const tabs = [{
    id: 'home',
    label: '首页',
    icon: Home
  }, {
    id: 'category',
    label: '分类',
    icon: LayoutGrid
  }, {
    id: 'group',
    label: '拼团',
    icon: Users
  }, {
    id: 'cart',
    label: '购物车',
    icon: ShoppingCart
  }, {
    id: 'profile',
    label: '我的',
    icon: User
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
              <Icon size={20} className="mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>;
      })}
      </div>
    </div>;
}