// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card } from '@/components/ui';

export function CategoryCard({
  name,
  icon,
  onClick,
  className = ''
}) {
  return <Card className={`p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${className}`} onClick={onClick}>
      <div className="flex flex-col items-center gap-2">
        {/* 修复：将emoji表情用span标签包裹 */}
        <span className="text-2xl">{icon || '📦'}</span>
        <span className="text-sm font-medium">{name}</span>
      </div>
    </Card>;
}