// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Carousel({
  images
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };
  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };
  return <div className="relative w-full h-48 overflow-hidden">
      <div className="flex transition-transform duration-300 ease-in-out" style={{
      transform: `translateX(-${currentIndex * 100}%)`
    }}>
        {images.map((image, index) => <div key={index} className="w-full h-48 flex-shrink-0">
            <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
          </div>)}
      </div>
      
      <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">
        <ChevronLeft size={20} />
      </button>
      
      <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">
        <ChevronRight size={20} />
      </button>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`} />)}
      </div>
    </div>;
}