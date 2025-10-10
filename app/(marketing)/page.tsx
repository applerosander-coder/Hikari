import Testimonials from '@/components/landing-page/testimonials-default';
import FAQSection from '@/components/landing-page/faq';
import Hero from '@/components/landing-page/hero';
import LogoCloud from '@/components/landing-page/logo-cloud-svg';
import FeaturesHover from '@/components/landing-page/features-hover';
import Pricing from '@/components/pricing/pricing-primary';
import Link from 'next/link';
import Image from 'next/image';

export default async function IndexPage() {
  return (
      <div className="flex-col gap-10 mb-5">
        <Hero />
        <LogoCloud />
        <FeaturesHover />
        <Pricing />
        <Testimonials />
        <section className="my-16">
          <div className="flex items-center w-full mb-8">
            <div className="flex flex-col items-center justify-center w-full">
              <h2 className="text-3xl font-bold">Join Our Community</h2>
              <p className="mt-2 text-muted-foreground max-w-xl text-center">
                Connect with thousands of bidders, share your wins, and discover insider tips from our active community
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 w-full mx-auto">
            <Link 
              href="/dashboard" 
              className="px-6 py-3 rounded-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors font-semibold"
            >
              Start Bidding Now
            </Link>
            <Link 
              href="/pricing" 
              className="px-6 py-3 rounded-full border-2 border-primary dark:border-white hover:bg-muted transition-colors font-semibold"
            >
              View Plans
            </Link>
          </div>
        </section>
      <FAQSection />
    </div>
  );
}
