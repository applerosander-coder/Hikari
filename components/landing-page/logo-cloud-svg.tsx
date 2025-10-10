'use client';

export default function LogoCloud() {
  return (
    <div>
      <p className="mt-12 text-xs uppercase text-primary text-center font-bold tracking-[0.3em]">
        Trusted by
      </p>
      <div className="grid grid-cols-1 place-items-center justify-center my-12 space-y-8 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-5xl sm:grid sm:gap-10 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Premium Collectors Guild */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="font-bold text-base">Premium Collectors</div>
            <div className="text-xs text-muted-foreground">Guild</div>
          </div>
        </div>

        {/* Vintage Dealers Network */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16V4H3v12h18zm0-14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7v2h2v2H8v-2h2v-2H3a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2h18zM5 6h9v5H5V6z"/>
              </svg>
            </div>
            <div className="font-bold text-base">Vintage Dealers</div>
            <div className="text-xs text-muted-foreground">Network</div>
          </div>
        </div>

        {/* Estate Sales Association */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div className="font-bold text-base">Estate Sales</div>
            <div className="text-xs text-muted-foreground">Association</div>
          </div>
        </div>

        {/* Antique Traders Union */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="font-bold text-base">Antique Traders</div>
            <div className="text-xs text-muted-foreground">Union</div>
          </div>
        </div>

        {/* Art Buyers Collective */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.48.41-2.86 1.12-4.06l10.94 10.94C14.86 19.59 13.48 20 12 20zm6.88-3.94L8.94 6.12C10.14 5.41 11.52 5 13 5c4.41 0 8 3.59 8 8 0 1.48-.41 2.86-1.12 4.06z"/>
              </svg>
            </div>
            <div className="font-bold text-base">Art Buyers</div>
            <div className="text-xs text-muted-foreground">Collective</div>
          </div>
        </div>

        {/* Luxury Goods Exchange */}
        <div className="flex items-center justify-center h-20 w-full px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z"/>
              </svg>
            </div>
            <div className="font-bold text-base">Luxury Goods</div>
            <div className="text-xs text-muted-foreground">Exchange</div>
          </div>
        </div>

      </div>
    </div>
  );
}
