import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function FooterBlog() {
  return (
    <footer className="py-10 w-full">
      <Separator className="mb-8 w-4/5 mx-auto" />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center md:flex-row justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/bidwin-logo-light.png"
              alt="BIDWIN" 
              width={240} 
              height={120}
              className="h-16 w-auto dark:hidden"
            />
            <Image 
              src="/bidwin-logo-dark.png"
              alt="BIDWIN" 
              width={240} 
              height={120}
              className="h-16 w-auto hidden dark:block"
            />
          </div>
          <div className="flex flex-col items-center md:items-end space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Empowering communities through innovative auction fundraising
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right mt-2">
              © {new Date().getFullYear()} BIDWIN. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
