// @ts-ignore;
import React, { useCallback, useEffect, useRef } from 'react';

export const VirtualizedList = ({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading
}) => {
  const observerRef = useRef();
  const lastItemRef = useRef();
  const handleObserver = useCallback(entries => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: '100px'
    });
    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);
  return <div className="space-y-4">
      {items.map((item, index) => <div key={item.id || index} ref={index === items.length - 1 ? lastItemRef : null}>
          {renderItem(item)}
        </div>)}
      {loading && <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>}
      {!hasMore && items.length > 0 && <div className="text-center py-4 text-gray-500">没有更多数据了</div>}
    </div>;
};