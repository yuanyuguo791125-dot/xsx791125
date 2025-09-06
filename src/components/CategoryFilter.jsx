// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';

export function CategoryFilter({
  categories = [],
  selectedCategory,
  onCategoryChange,
  className = ''
}) {
  return <div className={`flex gap-2 overflow-x-auto pb-2 ${className}`}>
      {categories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? 'default' : 'outline'} size="sm" className="whitespace-nowrap" onClick={() => onCategoryChange(category.id)}>
          <span className="mr-1">{category.icon}</span>
          {category.name}
        </Button>)}
    </div>;
}