// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';

// @ts-ignore;
import { LazyImage } from '@/components/LazyImage';

// 图片路径处理
const processImageUrl = url => {
  if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
  if (url.startsWith('cloud://')) {
    return url.replace('cloud://', 'https://your-cdn.com/');
  }
  if (url.startsWith('/')) {
    return `https://your-cdn.com${url}`;
  }
  return url;
};
export function Carousel({
  banners = [],
  autoPlay = true,
  interval = 3000,
  height = 200,
  className = ''
}) {
  // 确保 banners 是数组
  const safeBanners = Array.isArray(banners) ? banners : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // 空数组处理
  if (safeBanners.length === 0) {
    return <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`} style={{
      height: `${height}px`
    }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">暂无轮播图</p>
        </div>
      </div>;
  }

  // 下一张
  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % safeBanners.length);
  }, [safeBanners.length]);

  // 上一张
  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + safeBanners.length) % safeBanners.length);
  }, [safeBanners.length]);

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || safeBanners.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, interval, nextSlide, safeBanners.length]);

  // 点击指示器
  const goToSlide = useCallback(index => {
    setCurrentIndex(index);
  }, []);

  // 鼠标悬停暂停
  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(autoPlay);
  }, [autoPlay]);
  return <div className={`relative overflow-hidden rounded-lg ${className}`} style={{
    height: `${height}px`
  }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* 轮播图片 */}
      <div className="flex transition-transform duration-300 ease-in-out" style={{
      transform: `translateX(-${currentIndex * 100}%)`
    }}>
        {safeBanners.map((banner, index) => <div key={banner.id || index} className="w-full flex-shrink-0" style={{
        height: `${height}px`
      }}>
            <LazyImage src={processImageUrl(banner.image)} alt={banner.title || `Banner ${index + 1}`} className="w-full h-full object-cover" />
            {banner.title && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <h3 className="text-white text-lg font-semibold">{banner.title}</h3>
              </div>}
          </div>)}
      </div>

      {/* 左右箭头 */}
      {safeBanners.length > 1 && <>
          <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onClick={prevSlide}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onClick={nextSlide}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>}

      {/* 指示器 */}
      {safeBanners.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {safeBanners.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`} onClick={() => goToSlide(index)} />)}
        </div>}
    </div>;
}