'use client';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Ripple from '@/components/magicui/ripple';
import AnimatedGradientText from '@/components/magicui/animated-shiny-text';
import { ArrowRightIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
import AvatarCircles from '@/components/magicui/avatar-circles';
import { useTheme } from 'next-themes';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ParticleFieldCSS from '@/components/particle-field-css'
import { CoolMode } from '@/components/magicui/cool-mode'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  const { theme } = useTheme();
  const avatarUrls = [
    'https://avatars.githubusercontent.com/u/16860528',
    'https://avatars.githubusercontent.com/u/20110627',
    'https://avatars.githubusercontent.com/u/106103625',
    'https://avatars.githubusercontent.com/u/59228569',
  ];

  const quotes = [
    { text: "That's beautiful bro!", author: "dcodesdev", title: "TypeScript Developer", avatarFallback: "DC", avatarImg: "/images/dcodes.png" },
    { text: "If you've built this a few months ago, it would have saved me hours :D", author: "SuhailKakar", title: "Developer at joinOnboard", avatarFallback: "SK", avatarImg: "/images/SuhailKakar.jpg" },
    { text: "So cool, looks really clean. Any plan to open source it? ☺️ Wanna play with it!", author: "SaidAitmbarek", title: "Founder of microlaunch.net", avatarFallback: "SA", avatarImg: "/images/said.jpg" },
  ];

  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentQuote((prevQuote) => (prevQuote + 1) % quotes.length)
    }, 5000) // Change quote every 5 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="relative z-0 w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Ripple />
      </div>
      <div className="absolute inset-0 z-[1]">
        <ParticleFieldCSS />
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-32">
        <div className="relative z-10 flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
          <h1 className="font-heading tracking-tight font-bold text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl px-2">
            Win Amazing Items Through Live Online Auctions
          </h1>
          <div className="max-w-[42rem] font-bold tracking-tight text-primary text-sm sm:text-base md:text-lg lg:text-xl sm:leading-8 rounded-full p-2 px-4">
            Discover unique items, place your bids, and win incredible deals. 
            Join thousands of bidders competing in real-time auctions with transparent pricing.
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className={cn(buttonVariants({ size: 'xl' }), 'rounded-full border-2 border-primary dark:border-white text-bold text-white')}>
              Browse Auctions
            </Link>
            <CoolMode>
              <Button
                variant="outline"
                size="xl"
                className="rounded-full border-2 border-primary dark:border-white text-semibold select-none"
              >
                Confetti
              </Button>
            </CoolMode>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full">
            <AvatarCircles numPeople={1247} avatarUrls={avatarUrls} />
            <div className="flex flex-col mt-2">
              <div className="flex flex-row justify-center sm:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-yellow-200 text-yellow-300 size-5"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold">
                Join 1,200+ active bidders
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
