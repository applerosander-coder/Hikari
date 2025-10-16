'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface NavOption {
  label: string;
  value: string;
}

interface AuctionCategoryNavProps {
  auctionOptions: NavOption[];
  categoryOptions: NavOption[];
  valueAuction: string;
  valueCategory: string;
  onChangeAuction: (v: string) => void;
  onChangeCategory: (v: string) => void;
}

export function AuctionCategoryNav({
  auctionOptions,
  categoryOptions,
  valueAuction,
  valueCategory,
  onChangeAuction,
  onChangeCategory,
}: AuctionCategoryNavProps) {
  const [showAuctionSheet, setShowAuctionSheet] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [visibleAuctionCount, setVisibleAuctionCount] = useState(auctionOptions.length);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(categoryOptions.length);
  
  const auctionRowRef = useRef<HTMLDivElement>(null);
  const categoryRowRef = useRef<HTMLDivElement>(null);

  const MAX_VISIBLE_ITEMS = 5;

  useEffect(() => {
    const checkOverflow = () => {
      if (auctionRowRef.current) {
        const containerWidth = auctionRowRef.current.offsetWidth;
        let estimatedWidth = 0;
        let count = 0;
        
        for (let i = 0; i < auctionOptions.length; i++) {
          const labelLength = auctionOptions[i].label.length;
          const itemWidth = Math.max(80, labelLength * 8 + 32);
          estimatedWidth += itemWidth + 4;
          
          if (estimatedWidth < containerWidth - 80) {
            count++;
          } else {
            break;
          }
        }
        
        setVisibleAuctionCount(Math.min(count || MAX_VISIBLE_ITEMS, auctionOptions.length));
      }
      
      if (categoryRowRef.current) {
        const containerWidth = categoryRowRef.current.offsetWidth;
        let estimatedWidth = 0;
        let count = 0;
        
        for (let i = 0; i < categoryOptions.length; i++) {
          const labelLength = categoryOptions[i].label.length;
          const itemWidth = Math.max(60, labelLength * 8 + 24);
          estimatedWidth += itemWidth + 8;
          
          if (estimatedWidth < containerWidth - 80) {
            count++;
          } else {
            break;
          }
        }
        
        setVisibleCategoryCount(Math.min(count || MAX_VISIBLE_ITEMS, categoryOptions.length));
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [auctionOptions, categoryOptions]);

  const visibleAuctions = auctionOptions.slice(0, visibleAuctionCount);
  const hasMoreAuctions = auctionOptions.length > visibleAuctionCount;
  
  const visibleCategories = categoryOptions.slice(0, visibleCategoryCount);
  const hasMoreCategories = categoryOptions.length > visibleCategoryCount;

  const handleAuctionSelect = (value: string) => {
    onChangeAuction(value);
    setShowAuctionSheet(false);
  };

  const handleCategorySelect = (value: string) => {
    onChangeCategory(value);
    setShowCategorySheet(false);
  };

  return (
    <>
      <div className="sticky top-0 z-30 pt-safe-top backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        {/* Top Row: Auction Tabs */}
        <div ref={auctionRowRef} className="flex items-center gap-1 px-4 pt-2 pb-1.5 overflow-x-auto scrollbar-hide">
          {visibleAuctions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAuctionSelect(option.value)}
              className={`
                flex-shrink-0 h-8 px-3 rounded text-sm font-medium transition-colors whitespace-nowrap
                ${valueAuction === option.value
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {option.label}
            </button>
          ))}
          
          {hasMoreAuctions && (
            <button
              onClick={() => setShowAuctionSheet(true)}
              className="flex-shrink-0 h-8 px-3 rounded text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              More <ChevronDown className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Second Row: Category Chips */}
        <div ref={categoryRowRef} className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {visibleCategories.map((option) => (
            <button
              key={option.value}
              onClick={() => handleCategorySelect(option.value)}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${valueCategory === option.value
                  ? 'bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {option.label}
            </button>
          ))}
          
          {hasMoreCategories && (
            <button
              onClick={() => setShowCategorySheet(true)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              More <ChevronDown className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Auction Bottom Sheet */}
      {showAuctionSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowAuctionSheet(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-safe-bottom max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">Select Auction</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {auctionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAuctionSelect(option.value)}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-colors text-left
                    ${valueAuction === option.value
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Bottom Sheet */}
      {showCategorySheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowCategorySheet(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-safe-bottom max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">Select Category</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleCategorySelect(option.value)}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-colors text-left
                    ${valueCategory === option.value
                      ? 'bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
