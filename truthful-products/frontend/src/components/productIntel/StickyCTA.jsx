import React, { useState, useEffect } from 'react';
import { ExternalLink, Share2, Bookmark } from 'lucide-react';

/**
 * Sticky CTA Component
 * Floating action button at bottom of screen (mobile-optimized)
 */
const StickyCTA = ({ price, retailer, affiliateLink, onShare, onSave }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop for actions */}
      {showActions && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setShowActions(false)}
        />
      )}

      {/* Quick Actions - Slide up from bottom */}
      <div
        className={`fixed bottom-20 left-0 right-0 z-50 transition-all duration-300 ${
          showActions ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 p-4 space-y-2">
            {/* Share Button */}
            <button
              onClick={() => {
                onShare?.();
                setShowActions(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Share2 size={20} className="text-primary" />
              <span className="font-semibold text-navy">Share Product</span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                onSave?.();
                setShowActions(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bookmark size={20} className="text-primary" />
              <span className="font-semibold text-navy">Save for Later</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl safe-area-bottom">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Quick Actions Toggle */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors active:scale-95"
            >
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-navy rounded-full"></div>
                <div className="w-1 h-1 bg-navy rounded-full"></div>
                <div className="w-1 h-1 bg-navy rounded-full"></div>
              </div>
            </button>

            {/* Price Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-navy-light truncate">
                Best price at {retailer}
              </div>
              <div className="text-xl font-bold text-primary">
                ${price}
              </div>
            </div>

            {/* Main CTA Button - Large touch target */}
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 shadow-lg flex items-center gap-2"
              style={{ minWidth: '140px', minHeight: '48px' }}
            >
              <span>Check Price</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Safe area spacer for iOS */}
      <div className="h-20"></div>
    </>
  );
};

export default StickyCTA;
