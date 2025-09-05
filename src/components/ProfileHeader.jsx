// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { User, ChevronRight } from 'lucide-react';

export function ProfileHeader({
  userInfo
}) {
  return <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <User size={32} />
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-bold">{userInfo.nickname || '同学'}</h2>
          <p className="text-sm opacity-90">会员等级：{userInfo.level || '普通会员'}</p>
        </div>
      </div>
      
      <div className="mt-4 bg-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">当前积分</p>
            <p className="text-2xl font-bold">{userInfo.points || 1280}</p>
          </div>
          <button className="bg-white/20 px-4 py-2 rounded-full text-sm">
            积分明细
          </button>
        </div>
      </div>
    </div>;
}