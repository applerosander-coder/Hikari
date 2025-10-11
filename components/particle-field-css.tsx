'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  element: HTMLDivElement;
}

export default function ParticleFieldCSS() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const particleCount = 100;
    const color = theme === 'dark' ? 'white' : 'black';

    // Create particle elements once
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.background = color;
      element.style.borderRadius = '50%';
      element.style.pointerEvents = 'none';
      element.style.willChange = 'transform, opacity';
      containerRef.current!.appendChild(element);

      return {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        z: Math.random() * 500 - 250,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        speedZ: (Math.random() - 0.5) * 0.5,
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

      particlesRef.current.forEach((p) => {
        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;
        p.z += p.speedZ;

        // Bounce at boundaries
        if (Math.abs(p.x) > 50) p.speedX *= -1;
        if (Math.abs(p.y) > 50) p.speedY *= -1;
        if (Math.abs(p.z) > 250) p.speedZ *= -1;

        // Clamp positions
        p.x = Math.max(-50, Math.min(50, p.x));
        p.y = Math.max(-50, Math.min(50, p.y));
        p.z = Math.max(-250, Math.min(250, p.z));

        // Calculate depth-based scale and opacity
        const scale = 1 + p.z / 250;
        const opacity = 0.3 + (p.z + 250) / 1000;
        const size = 3 * scale;

        // Apply parallax offset based on depth
        const parallaxX = mousePos.current.x * (p.z / 500);
        const parallaxY = mousePos.current.y * (p.z / 500);

        // Update only transform and opacity (no DOM reconstruction)
        p.element.style.width = `${size}px`;
        p.element.style.height = `${size}px`;
        p.element.style.opacity = `${opacity}`;
        p.element.style.transform = `translate3d(${(p.x + parallaxX) * scale}px, ${(p.y + parallaxY) * scale}px, ${p.z}px) translate(-50%, -50%)`;
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
      // Clean up particle elements
      particlesRef.current.forEach((p) => p.element.remove());
      particlesRef.current = [];
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
