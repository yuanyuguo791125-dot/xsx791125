// @ts-ignore;
import React from 'react';

export const SkeletonLoader = ({
  type
}) => {
  const skeletons = {
    home: <div className="space-y-4">
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
      </div>,
    productList: <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-gray-200 rounded animate-pulse"></div>)}
      </div>,
    orderList: <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>)}
      </div>,
    cart: <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>)}
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse fixed bottom-20 left-4 right-4"></div>
      </div>,
    payment: <div className="space-y-4">
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>)}
        </div>
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
  };
  return skeletons[type] || skeletons.home;
};