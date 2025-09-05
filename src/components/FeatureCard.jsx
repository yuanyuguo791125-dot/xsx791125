// @ts-ignore;
import React from 'react';

export function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick
}) {
  return <button onClick={onClick} className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="ml-3 text-left">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </button>;
}