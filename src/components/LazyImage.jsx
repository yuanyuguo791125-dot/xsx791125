// @ts-ignore;
import React, { useState, useEffect, useRef, memo } from 'react';

export const LazyImage = memo(({
  src,
  alt,
  className = '',
  placeholder = 'https://via.placeholder.com/400x300?text=Loading...',
  errorPlaceholder = 'https://via.placeholder.com/400x300?text=Error',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 验证图片URL
  const validateUrl = url => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 清理函数
  const cleanup = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // 加载图片
  const loadImage = async imageUrl => {
    if (!validateUrl(imageUrl)) {
      setImageSrc(errorPlaceholder);
      setIsLoading(false);
      setHasError(true);
      return;
    }
    try {
      setIsLoading(true);
      setHasError(false);

      // 创建新的 AbortController
      cleanup();
      abortControllerRef.current = new AbortController();

      // 使用 Image 对象预加载
      const img = new Image();
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Image load timeout'));
        }, 10000); // 10秒超时

        img.onload = () => {
          clearTimeout(timeoutId);
          if (!abortControllerRef.current?.signal.aborted) {
            setImageSrc(imageUrl);
            setIsLoading(false);
            setHasError(false);
            resolve();
          }
        };
        img.onerror = () => {
          clearTimeout(timeoutId);
          if (!abortControllerRef.current?.signal.aborted) {
            setImageSrc(errorPlaceholder);
            setIsLoading(false);
            setHasError(true);
            reject(new Error('Image load error'));
          }
        };
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Image loading failed:', error);
      if (!abortControllerRef.current?.signal.aborted) {
        setImageSrc(errorPlaceholder);
        setIsLoading(false);
        setHasError(true);
      }
    }
  };

  // 初始加载
  useEffect(() => {
    if (src) {
      loadImage(src);
    } else {
      setImageSrc(errorPlaceholder);
      setIsLoading(false);
      setHasError(true);
    }
    return cleanup;
  }, [src]);

  // 懒加载实现
  useEffect(() => {
    if (!imgRef.current || !src) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(src);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });
    observer.observe(imgRef.current);
    observerRef.current = observer;
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src]);
  return <div className="relative">
      {isLoading && <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />}
      <img ref={imgRef} src={imageSrc} alt={alt || '商品图片'} className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} loading="lazy" onError={() => {
      if (!hasError) {
        setImageSrc(errorPlaceholder);
        setIsLoading(false);
        setHasError(true);
      }
    }} {...props} />
      {hasError && <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-xs text-gray-500">图片加载失败</span>
        </div>}
    </div>;
});

// 添加 displayName 用于调试
LazyImage.displayName = 'LazyImage';