// @ts-ignore;
import React from 'react';

export function CategoryCard({
  icon: Icon,
  title,
  color,
  onClick
}) {
  return <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </button>;
}