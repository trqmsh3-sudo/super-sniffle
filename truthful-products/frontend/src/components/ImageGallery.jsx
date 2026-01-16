import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

/**
 * ImageGallery Component
 * Displays multiple product images with navigation and lightbox
 */
const ImageGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  
  // Handle empty or invalid images
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-2 border-border">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-sm">אין תמונה זמינה</div>
        </div>
      </div>
    );
  }
  
  // Filter out error images
  const validImages = images.filter((_, idx) => !imageErrors.has(idx));
  
  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-2 border-border">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-sm">לא הצלחנו לטעון תמונות</div>
        </div>
      </div>
    );
  }
  
  const currentImage = validImages[activeIndex] || validImages[0];
  const currentImageUrl = typeof currentImage === 'string' ? currentImage : currentImage?.url;
  
  const handlePrev = () => {
    setActiveIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  };
  
  const handleImageError = (index) => {
    setImageErrors(prev => new Set([...prev, index]));
    // Move to next valid image if current one failed
    if (activeIndex === index && validImages.length > 1) {
      setActiveIndex(prev => (prev + 1) % images.length);
    }
  };
  
  const handleKeyDown = (e) => {
    if (!isLightboxOpen) return;
    if (e.key === 'ArrowLeft') handleNext();
    if (e.key === 'ArrowRight') handlePrev();
    if (e.key === 'Escape') setIsLightboxOpen(false);
  };
  
  React.useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isLightboxOpen, handleKeyDown]);
  
  return (
    <>
      {/* Main image container */}
      <div className="relative group">
        <div className="relative aspect-square bg-white rounded-2xl border-2 border-border overflow-hidden shadow-lg">
          {/* Main image */}
          <img
            src={currentImageUrl}
            alt={productName || 'Product image'}
            className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
            onClick={() => setIsLightboxOpen(true)}
            onError={() => handleImageError(activeIndex)}
          />
          
          {/* Zoom hint */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="הגדל תמונה"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          {/* Navigation arrows (only if multiple images) */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                title="תמונה קודמת"
              >
                <ChevronRight className="h-5 w-5 text-ink" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                title="תמונה הבאה"
              >
                <ChevronLeft className="h-5 w-5 text-ink" />
              </button>
            </>
          )}
          
          {/* Image counter */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {activeIndex + 1} / {validImages.length}
            </div>
          )}
        </div>
        
        {/* Thumbnails (only if multiple images) */}
        {validImages.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {validImages.map((img, index) => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              return (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                    ${index === activeIndex 
                      ? 'border-mint-500 ring-2 ring-mint-200 scale-110' 
                      : 'border-border hover:border-mint-300 hover:scale-105'
                    }
                  `}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                </button>
              );
            })}
          </div>
        )}
        
        {/* Image source attribution */}
        {currentImage?.source && (
          <div className="mt-2 text-xs text-slate-500 text-center">
            תמונה מ-{currentImage.source === 'unsplash' ? 'Unsplash' : currentImage.source === 'pexels' ? 'Pexels' : currentImage.source}
            {currentImage.photographer && ` • ${currentImage.photographer}`}
          </div>
        )}
      </div>
      
      {/* Lightbox modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-mint-300 transition-colors bg-black/50 rounded-lg p-2 hover:bg-black/70"
            title="סגור"
          >
            <X className="h-8 w-8" />
          </button>
          
          {/* Main lightbox image */}
          <img
            src={currentImageUrl}
            alt={productName || 'Product image'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Navigation in lightbox */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all hover:scale-110"
                title="תמונה קודמת"
              >
                <ChevronRight className="h-7 w-7 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all hover:scale-110"
                title="תמונה הבאה"
              >
                <ChevronLeft className="h-7 w-7 text-white" />
              </button>
              
              {/* Image counter in lightbox */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-full">
                {activeIndex + 1} / {validImages.length}
              </div>
            </>
          )}
          
          {/* Keyboard hint */}
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            <div>← → ניווט</div>
            <div>ESC סגירה</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
