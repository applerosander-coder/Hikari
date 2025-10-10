'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  compact?: boolean;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function AuctionCountdown({ endDate, compact = false, onExpire }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(endDate));

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <Clock className="h-5 w-5 text-primary" />
        <div className="flex gap-2">
          <TimeUnit value={0} label="Days" />
          <Separator />
          <TimeUnit value={0} label="Hours" />
          <Separator />
          <TimeUnit value={0} label="Min" />
          <Separator />
          <TimeUnit value={0} label="Sec" />
        </div>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Auction Ended</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Clock className="h-5 w-5 text-primary" />
      <div className="flex gap-2">
        <TimeUnit value={timeLeft.days} label="Days" />
        <Separator />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[50px]">
      <span className="text-2xl font-bold tabular-nums">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

function Separator() {
  return <span className="text-2xl font-bold text-muted-foreground">:</span>;
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const difference = new Date(endDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false
  };
}
