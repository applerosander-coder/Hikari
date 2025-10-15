import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blog } from '@/utils/source';
import { createMetadata } from '@/utils/metadata';
import { buttonVariants } from '@/components/ui/button';
import { Control } from './page.client';

interface Param {
  slug: string;
}

export const dynamicParams = false;

export default function Page({
  params
}: {
  params: Param;
}): React.ReactElement {
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  const svg = `<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'>
  <filter id='noiseFilter'>
    <feTurbulence 
      type='fractalNoise' 
      baseFrequency='0.65' 
      numOctaves='3' 
      stitchTiles='stitch'/>
  </filter>
  
  <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
</svg>`;

  return (
    <main className="container max-sm:px-0 md:py-12">
      <div
        className="rounded-xl border py-12"
        style={{
          backgroundImage: [
            `linear-gradient(to right, 
              rgba(0, 0, 0, 0.1),
              hsl(var(--background) / 0.9) 40%,
              hsl(var(--background)) 50%,
              hsl(var(--background) / 0.9) 60%,
              rgba(0, 0, 0, 0.1)
            ),
            radial-gradient(
              circle at center,
              hsl(var(--background)) 80%,
              rgba(0, 0, 0, 0.1) 100%
            )`,
            `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
          ].join(', ')
        }}
      >
        <div className="mb-6">
          <Image 
            src="/bidwin-logo-light.png"
            alt="BIDWIN" 
            width={140} 
            height={70}
            className="h-12 w-auto dark:hidden"
            priority
          />
          <Image 
            src="/bidwin-logo-dark.png"
            alt="BIDWIN" 
            width={140} 
            height={70}
            className="h-12 w-auto hidden dark:block"
            priority
          />
        </div>
        <h1 className="mb-2 text-3xl font-bold">
          {page.data.title}
        </h1>
        <p className="mb-4 text-muted-foreground">{page.data.description}</p>
        <Link
          href="/blog"
          className={buttonVariants({ size: 'sm', variant: 'secondary' })}
        >
          Back
        </Link>
      </div>
      <article className="grid grid-cols-1 px-0 py-8 lg:grid-cols-[2fr_1fr] lg:px-4">
        <div className="prose p-4">
          <InlineTOC items={page.data.exports.toc} />
          <page.data.exports.default />
        </div>
        <div className="flex flex-col gap-4 border-l p-4 text-sm">
          <div>
            <p className="mb-1 text-muted-foreground">Written by</p>
            <p className="font-medium">{page.data.author}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted-foreground">At</p>
            <p className="font-medium">
              {new Date(page.data.date ?? page.file.name).toDateString()}
            </p>
          </div>
          <Control url={page.url} />
        </div>
      </article>
    </main>
  );
}

export function generateMetadata({ params }: { params: Param }): Metadata {
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  return createMetadata({
    title: page.data.title,
    description:
      page.data.description ?? 'The library for building documentation sites'
  });
}

export async function generateStaticParams(): Promise<Param[]> {
  return blog.getPages().map<Param>((page) => ({
    slug: page.slugs[0]
  }));
}
