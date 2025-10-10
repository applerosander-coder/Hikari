'use client';
import Image from 'next/image';

export default function LogoCloud() {
  const partners = [
    {
      name: 'Latino Community Services',
      image: '/images/latino-community-services.png',
      width: 200,
      height: 80
    },
    {
      name: 'Sigma Software',
      image: '/images/sigma-software.png',
      width: 180,
      height: 80
    }
  ];

  return (
    <div>
      <p className="mt-12 text-xs uppercase text-primary text-center font-bold tracking-[0.3em]">
        developed for
      </p>
      <div className="grid grid-cols-1 place-items-center justify-center my-12 space-y-8 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-5xl sm:grid sm:gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {/* Latino Community Services */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <Image
            src="/images/latino-community-services.png"
            alt="Latino Community Services"
            width={200}
            height={80}
            className="object-contain h-full w-auto"
          />
        </div>

        {/* Sigma Software */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <Image
            src="/images/sigma-software.png"
            alt="Sigma Software"
            width={180}
            height={80}
            className="object-contain h-full w-auto"
          />
        </div>

        {/* Community Health Partners */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="font-bold text-sm">Community Health</div>
            <div className="text-xs text-muted-foreground">Partners</div>
          </div>
        </div>

        {/* Youth Development Foundation */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.72c0 4.35-2.91 8.38-7 9.52-4.09-1.14-7-5.17-7-9.52V7.78l6-2.7 1 .1z"/>
              </svg>
            </div>
            <div className="font-bold text-sm">Youth Development</div>
            <div className="text-xs text-muted-foreground">Foundation</div>
          </div>
        </div>

        {/* Education Access Network */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <div className="font-bold text-sm">Education Access</div>
            <div className="text-xs text-muted-foreground">Network</div>
          </div>
        </div>

        {/* Family Support Alliance */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div className="font-bold text-sm">Family Support</div>
            <div className="text-xs text-muted-foreground">Alliance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
