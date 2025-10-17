import Link from 'next/link';
import Image from 'next/image';
import { blog } from '@/utils/source';

export default function Page(): React.ReactElement {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? b.file.name).getTime() -
      new Date(a.data.date ?? a.file.name).getTime()
  );

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
      <div className="rounded-lg overflow-hidden">
        <div
          className="h-[300px] p-8 md:h-[400px] md:p-12 flex flex-col justify-center"
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
              width={400} 
              height={200}
              className="h-32 w-auto dark:hidden"
              priority
            />
            <Image 
              src="/bidwin-logo-dark.png"
              alt="BIDWIN" 
              width={400} 
              height={200}
              className="h-32 w-auto hidden dark:block"
              priority
            />
          </div>
          <h1 className="mb-4 border-b-4 border-foreground pb-2 text-4xl font-bold md:text-5xl">
            Success Stories
          </h1>
          <p className="text-sm md:text-base">
            Empowering communities through innovative auction fundraising
          </p>
        </div>
        <div className="mt-2 grid grid-cols-1 border md:grid-cols-3 lg:grid-cols-4 rounded-b-lg">
          {posts.map((post) => (
            <Link
              key={post.url}
              href={post.url}
              className="flex flex-col bg-card p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <p className="font-medium">{post.data.title}</p>
              <p className="text-sm text-muted-foreground">
                {post.data.description}
              </p>

              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                {new Date(post.data.date ?? post.file.name).toDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
