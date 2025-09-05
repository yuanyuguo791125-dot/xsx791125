// @ts-ignore;
import React, { useState, useEffect, useCallback, useRef } from 'react';

export const VirtualizedList = ({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  itemHeight = 120,
  overscan = 5,
  className = ''
}) => {
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: 20
  });
  const containerRef = useRef(null);
  const scrollTopRef = useRef(0);
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const {
      scrollTop,
      clientHeight
    } = containerRef.current;
    scrollTopRef.current = scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan;
    setVisibleRange({
      start: Math.max(0, start),
      end: Math.min(items.length, end)
    });
    if (hasMore && !loading && scrollTop + clientHeight >= containerRef.current.scrollHeight - 100) {
      onLoadMore?.();
    }
  }, [items.length, itemHeight, overscan, hasMore, loading, onLoadMore]);
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  return <div ref={containerRef} className={`overflow-y-auto ${className}`} style={{
    height: 'calc(100vh - 200px)'
  }}>
      <div style={{
      height: totalHeight,
      position: 'relative'
    }}>
        <div style={{
        transform: `translateY(${offsetY}px)`
      }}>
          {visibleItems.map((item, index) => <div key={item._id || index} style={{
          height: itemHeight
        }}>
              {renderItem(item, visibleRange.start + index)}
            </div>)}
        </div>
        {loading && <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>}
        {!hasMore && items.length > 0 && <div className="text-center py-4 text-gray-500">
            已加载全部
          </div>}
      </div>
    </div>;
};