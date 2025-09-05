// @ts-ignore;
import React from 'react';

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange
}) {
  return <div className="flex space-x-2 px-4 py-3 overflow-x-auto">
      {categories.map(category => <button key={category.id} onClick={() => onCategoryChange(category.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCategory === category.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
          {category.name}
        </button>)}
    </div>;
}