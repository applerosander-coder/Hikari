'use client';

import { features } from '@/config/features';
import { motion } from 'framer-motion';
import React from 'react';

export default function FeaturesHover() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-zinc-50 py-8 dark:bg-zinc-900 md:py-12 lg:py-24 rounded-6xl mb-10"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Explore Auction Categories
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Browse our diverse selection of auction categories. From electronics to collectibles,
          discover amazing deals on items and services across all your favorite categories.
        </p>
      </div>
      <div className="mx-auto grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:max-w-[64rem] px-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black p-6"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 fill-current text-black dark:text-white mb-4"
              fillRule={feature.fillRule as "evenodd" | "inherit" | "nonzero" | undefined}
            >
              <path d={feature.svgPath} />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-black dark:text-white">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      <div className="mx-auto text-center md:max-w-[58rem]">
        {/* <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Hikari also includes a blog and a full-featured documentation site
          built using Fumadocs and MDX.
        </p> */}
      </div>
    </section>
  );
}
