'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Trophy, Zap } from 'lucide-react';

interface BidSuccessCelebrationProps {
  bidAmount: number;
  auctionTitle: string;
  onClose: () => void;
  show: boolean;
}

const celebrationVariants = [
  {
    icon: Trophy,
    title: 'You\'re in the lead!',
    message: 'Great job — your bid is currently the highest!',
    color: 'from-gray-800 to-gray-950',
  },
  {
    icon: Sparkles,
    title: 'Winning Bid Confirmed!',
    message: 'You\'re on top! Keep watching the auction.',
    color: 'from-gray-900 to-black',
  },
  {
    icon: Zap,
    title: 'You\'re Leading!',
    message: 'Fantastic! Your bid is #1 right now.',
    color: 'from-black to-gray-800',
  },
  {
    icon: Heart,
    title: 'Bid Successful!',
    message: 'You\'re currently the highest bidder. Well done!',
    color: 'from-gray-950 to-gray-900',
  },
];

export function BidSuccessCelebration({ bidAmount, auctionTitle, onClose, show }: BidSuccessCelebrationProps) {
  const router = useRouter();
  const [variant, setVariant] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (show) {
      setVariant(Math.floor(Math.random() * celebrationVariants.length));
      
      fireConfetti();
      playSuccessSound();
      
      const timer = setTimeout(() => {
        onClose();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  useEffect(() => {
    if (show && bidAmount > 0) {
      const amountInDollars = bidAmount / 100;
      const duration = 800;
      const steps = 30;
      const increment = amountInDollars / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayAmount(Math.min(currentStep * increment, amountInDollars));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayAmount(amountInDollars);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [show, bidAmount]);

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#000000', '#ffffff', '#404040', '#737373', '#a3a3a3'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#000000', '#ffffff', '#737373'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#ffffff', '#737373'],
      });
    }, 250);
  };

  const playSuccessSound = async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const playNote = (frequency: number, startTime: number, duration: number = 0.15) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      playNote(523.25, now, 0.15);
      playNote(659.25, now + 0.1, 0.15);
      playNote(783.99, now + 0.2, 0.25);
    } catch (error) {
      console.warn('Could not play success sound:', error);
    }
  };

  const handleViewMyBids = () => {
    onClose();
    router.push('/mybids');
  };

  const currentVariant = celebrationVariants[variant];
  const Icon = currentVariant.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`relative w-full max-w-md bg-gradient-to-br ${currentVariant.color} p-8 rounded-2xl shadow-2xl border border-gray-700`}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2"
            >
              <div className="bg-white rounded-full p-4 shadow-xl">
                <Icon className="w-12 h-12 text-black" />
              </div>
            </motion.div>

            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255,255,255,0.1)',
                  '0 0 40px rgba(255,255,255,0.2)',
                  '0 0 20px rgba(255,255,255,0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="mt-8 text-center space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white"
              >
                {currentVariant.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-lg"
              >
                {currentVariant.message}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 my-6"
              >
                <p className="text-gray-400 text-sm mb-2">Your Winning Bid</p>
                <p className="text-4xl font-bold text-white">
                  ${displayAmount.toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm mt-2 truncate">{auctionTitle}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3"
              >
                <Button
                  onClick={handleViewMyBids}
                  className="flex-1 bg-white text-black hover:bg-gray-200"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  View My Bids
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-white/10"
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
