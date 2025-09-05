// @ts-ignore;
import React from 'react';

export const SkeletonLoader = ({
  type,
  count = 3
}) => {
  const skeletons = {
    home: <div className="space-y-4">
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({
          length: 8
        }, (_, i) => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({
          length: 4
        }, (_, i) => <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
      </div>,
    productDetail: <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>,
    cart: <div className="space-y-4">
        {Array.from({
        length: count
      }, (_, i) => <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>)}
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse fixed bottom-20 left-4 right-4"></div>
      </div>,
    orderList: <div className="space-y-4">
        {Array.from({
        length: count
      }, (_, i) => <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>)}
      </div>,
    orderDetail: <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>,
    payment: <div className="space-y-4">
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({
          length: 3
        }, (_, i) => <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>)}
        </div>
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
  };
  return skeletons[type] || skeletons.home;
};