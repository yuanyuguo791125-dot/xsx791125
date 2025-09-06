// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';

export function FeatureCard({
  icon: Icon,
  title,
  value,
  subtitle,
  onClick
}) {
  return <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 text-center">
        <Icon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </CardContent>
    </Card>;
}