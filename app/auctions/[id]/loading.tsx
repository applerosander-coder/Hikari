import { Spinner } from '@/components/ui/spinner';

export default function AuctionLoading() {
  return (
    <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading auction...</p>
      </div>
    </div>
  );
}
