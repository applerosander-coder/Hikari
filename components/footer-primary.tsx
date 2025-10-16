'use client'
import { useState, useEffect } from "react"
import React from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js'
import { useToast } from "@/components/ui/use-toast"
import { CoolMode } from "@/components/magicui/cool-mode";
import { useTheme } from 'next-themes';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const AnimatedUnderline = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
  <a 
    href={href} 
    className={`${className} relative overflow-hidden group`}
  >
    {children}
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
  </a>
);

export default function FooterPrimary() {
  const [email, setEmail] = useState('')
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('user_email_list')
        .insert([{ email }])
      
      if (error) throw error

      toast({
        title: "Subscribed! 🎉",
        description: "You'll now receive notifications about new auctions and exclusive deals!",
      })
      setEmail('')
    } catch (error) {
      console.error('Error inserting email:', error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <footer className="py-10 safe-x safe-bottom">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Browse</h3>
            <ul className="space-y-2">
              <li>
                <AnimatedUnderline href="/dashboard" className="text-primary">
                  Active Auctions
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/dashboard" className="text-primary">
                  My Bids
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/pricing" className="text-primary">
                  Pricing Plans
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/dashboard" className="text-primary">
                  All Categories →
                </AnimatedUnderline>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <AnimatedUnderline href="/about-auctions" className="text-primary">
                  About Auctions
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/how-it-works" className="text-primary">
                  How It Works
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/blog" className="text-primary">
                  Success Stories
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="mailto:support@bidwin.com" className="text-primary">
                  Support
                </AnimatedUnderline>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <AnimatedUnderline href="/terms-of-service" className="text-primary">
                  Terms of Service
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/privacy-policy" className="text-primary">
                  Privacy Policy
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/bidding-guidelines" className="text-primary">
                  Bidding Guidelines
                </AnimatedUnderline>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">
              Get Auction Alerts
            </h3>
            <p className="text-primary mb-4">
              Subscribe to receive notifications about new auctions, winning bids, and exclusive deals delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex">
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:outline-none">

                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full text-sm relative z-20 border-none" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CoolMode>
                <Button type="submit" className="my-1 bg-black text-white rounded-md mr-1 ">
                    <ArrowRightIcon className="h-5 w-5" />
                </Button>
                {/* <Button type="submit" className="w-full text-lg relative z-20 bg-gradient-to-b from-black to-gray-300/80 hover:from-gray-800 hover:to-gray-400/80 dark:from-white dark:to-slate-900/10 dark:hover:from-slate-200 dark:hover:to-slate-800/10">
                  <span className="bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-white dark:from-white dark:to-slate-900/10">
                    Subscribe
                  </span>
                </Button> */}
                </CoolMode>
              </div>
          </form>
          </div>
        </div>
        <div className="border-t mt-10 pt-6 flex flex-col items-center md:flex-row justify-between">
          <div className="flex items-center">
            {mounted && (
              <Image 
                src={resolvedTheme === 'dark' ? '/bidwin-logo-white.svg' : '/bidwin-logo.svg'}
                alt="BIDWIN" 
                width={100} 
                height={50}
                className="h-8 w-auto"
              />
            )}
          </div>
          <p className="text-gray-500 mt-4 md:mt-0">© Auctions Inc. 2025</p>
        </div>
      </div>
    </footer>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

