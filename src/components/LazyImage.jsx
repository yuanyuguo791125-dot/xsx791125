// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';

export function LazyImage({
  src,
  alt = '',
  className = '',
  placeholder = 'https://via.placeholder.com/100x100?text=Loading',
  errorPlaceholder = 'https://via.placeholder.com/100x100?text=Error',
  width,
  height,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  useEffect(() => {
    if (!src) {
      setImageSrc(errorPlaceholder);
      setIsLoading(false);
      return;
    }

    // 处理云存储路径
    const processedSrc = src.startsWith('cloud://') ? src.replace('cloud://', 'https://your-cdn.com/') : src;

    // 创建图片对象预加载
    const img = new Image();
    img.onload = () => {
      setImageSrc(processedSrc);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setImageSrc(errorPlaceholder);
      setIsLoading(false);
      setHasError(true);
    };
    img.src = processedSrc;
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, placeholder, errorPlaceholder]);
  const handleError = () => {
    setImageSrc(errorPlaceholder);
    setHasError(true);
    setIsLoading(false);
  };
  return <img ref={imgRef} src={imageSrc} alt={alt} className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`} onError={handleError} style={{
    width: width || 'auto',
    height: height || 'auto'
  }} {...props} />;
}