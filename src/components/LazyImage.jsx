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
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  useEffect(() => {
    if (!src) {
      setImageSrc(errorPlaceholder);
      setIsLoading(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(errorPlaceholder);
      setIsLoading(false);
    };
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, errorPlaceholder]);
  useEffect(() => {
    if (!imgRef.current || !src) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
          };
          img.onerror = () => {
            setImageSrc(errorPlaceholder);
            setIsLoading(false);
          };
          img.src = src;
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '50px'
    });
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, errorPlaceholder]);
  return <div className="relative">
      {isLoading && <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />}
      <img ref={imgRef} src={imageSrc} alt={alt} className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} {...props} />
    </div>;
});