'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Firefly {
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  element: HTMLDivElement;
  glowPhase: number;
  glowSpeed: number;
}

export default function ParticleFieldCSS() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const fireflyCount = 50;

    // Create firefly elements once with spread-out distribution
    firefliesRef.current = Array.from({ length: fireflyCount }, () => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.background = '#FFD700';
      element.style.borderRadius = '50%';
      element.style.pointerEvents = 'none';
      element.style.willChange = 'transform, opacity, box-shadow';
      containerRef.current!.appendChild(element);

      // Spread fireflies more toward edges using quadratic distribution
      const getSpreadValue = () => {
        const rand = Math.random();
        return rand < 0.5 ? rand * rand * 200 - 100 : 100 - (1 - rand) * (1 - rand) * 200;
      };

      return {
        x: getSpreadValue(),
        y: getSpreadValue(),
        z: Math.random() * 500 - 250,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        speedZ: (Math.random() - 0.5) * 0.3,
        glowPhase: Math.random() * Math.PI * 2,
        glowSpeed: 0.02 + Math.random() * 0.03,
        element,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMousePos.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 50;
      targetMousePos.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 50;
    };

    const animate = () => {
      // Smooth mouse interpolation for parallax
      mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * 0.1;
      mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * 0.1;

      firefliesRef.current.forEach((f) => {
        // Update positions with organic floating movement
        f.x += f.speedX + Math.sin(f.glowPhase) * 0.05;
        f.y += f.speedY + Math.cos(f.glowPhase * 0.7) * 0.05;
        f.z += f.speedZ;

        // Bounce at boundaries (wider area)
        if (Math.abs(f.x) > 100) f.speedX *= -1;
        if (Math.abs(f.y) > 100) f.speedY *= -1;
        if (Math.abs(f.z) > 250) f.speedZ *= -1;

        // Clamp positions (wider area)
        f.x = Math.max(-100, Math.min(100, f.x));
        f.y = Math.max(-100, Math.min(100, f.y));
        f.z = Math.max(-250, Math.min(250, f.z));

        // Update glow phase for pulsing effect
        f.glowPhase += f.glowSpeed;

        // Calculate depth-based scale and pulsing glow
        const scale = 1 + f.z / 250;
        const glowIntensity = (Math.sin(f.glowPhase) + 1) / 2; // 0 to 1
        const opacity = 0.3 + glowIntensity * 0.7;
        const size = (2 + glowIntensity * 2) * scale;
        const blur = (8 + glowIntensity * 12) * scale;

        // Apply parallax offset based on depth
        const parallaxX = mousePos.current.x * (f.z / 500);
        const parallaxY = mousePos.current.y * (f.z / 500);

        // Update firefly appearance with glow effect
        f.element.style.width = `${size}px`;
        f.element.style.height = `${size}px`;
        f.element.style.opacity = `${opacity}`;
        f.element.style.boxShadow = `0 0 ${blur}px ${blur / 2}px rgba(255, 215, 0, ${glowIntensity})`;
        f.element.style.transform = `translate3d(${(f.x + parallaxX) * scale}px, ${(f.y + parallaxY) * scale}px, ${f.z}px) translate(-50%, -50%)`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clean up firefly elements
      firefliesRef.current.forEach((f) => f.element.remove());
      firefliesRef.current = [];
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{
        perspective: '1000px',
        perspectiveOrigin: 'center center',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }}
    />
  );
}
