// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageGallery({
  images
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };
  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };
  return <div className="relative">
      <div className="relative h-80 overflow-hidden">
        <img src={images[currentIndex]} alt="商品图片" className="w-full h-full object-cover" />
        {images.length > 1 && <>
            <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">
              <ChevronRight size={20} />
            </button>
          </>}
      </div>
      
      {images.length > 1 && <div className="flex justify-center mt-2 space-x-2">
          {images.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`} />)}
        </div>}
    </div>;
}