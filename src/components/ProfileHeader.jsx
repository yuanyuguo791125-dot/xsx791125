// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';

export function ProfileHeader({
  user,
  onEdit
}) {
  if (!user) return null;
  return <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.nickname?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.nickname || '用户昵称'}</h2>
            <p className="text-sm text-gray-500">{user.phone || '未绑定手机号'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Lv.{user.level || 1}</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{user.points || 0} 积分</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}