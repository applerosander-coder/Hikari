'use client';

import { features } from '@/config/features';
import { motion } from 'framer-motion';
import React from 'react';

export default function FeaturesHover() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-zinc-50 py-8 dark:bg-zinc-900 md:py-12 lg:py-24 rounded-6xl mb-10 px-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center px-4">
        <h2 className="font-heading text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
          Explore Auction Categories
        </h2>
        <p className="max-w-[90%] sm:max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base md:text-lg sm:leading-7 px-2">
          Browse our diverse selection of auction categories. From electronics to collectibles,
          discover amazing deals on items and services across all your favorite categories.
        </p>
      </div>
      <div className="mx-auto grid w-full gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:max-w-[64rem] px-2 sm:px-0">
        {features.map((feature) => (
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', bounce: 0.7 }}
            key={feature.title}
            className="relative overflow-hidden rounded-lg border bg-background dark:bg-zinc-950 p-4 sm:p-6"
          >
            <a target="_blank" rel="noopener noreferrer" href={feature.link}>
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10 sm:h-12 sm:w-12 fill-current mb-3 sm:mb-4"
                fillRule={feature.fillRule as "evenodd" | "inherit" | "nonzero" | undefined}
              >
                <path d={feature.svgPath} />
              </svg>
              <div className="mb-2 text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                {feature.title}
              </div>
              <div className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-500">
                {feature.description}
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
