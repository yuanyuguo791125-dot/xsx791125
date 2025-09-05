// @ts-ignore;
import React, { useState, useEffect } from 'react';

export const LazyImage = ({
  src,
  alt,
  className,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [src]);
  if (loading) {
    return <div className={`${className} bg-gray-200 animate-pulse rounded`} />;
  }
  if (error) {
    return <div className={`${className} bg-gray-100 flex items-center justify-center rounded`}>
        <span className="text-gray-400 text-xs">图片加载失败</span>
      </div>;
  }
  return <img src={imageSrc} alt={alt} className={className} loading="lazy" {...props} />;
};