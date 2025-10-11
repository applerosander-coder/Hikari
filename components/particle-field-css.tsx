'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface GlitterParticle {
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  element: HTMLDivElement;
  twinklePhase: number;
  twinkleSpeed: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

export default function ParticleFieldCSS() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const glitterRef = useRef<GlitterParticle[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const glitterCount = 40;
    const glitterColors = [
      '#FFD700', // Gold
      '#E5E4E2', // Platinum
      '#C0C0C0', // Silver
      '#FFFFFF', // White
      '#D4AF37', // Metallic gold
    ];

    // Create glitter confetti elements once with spread-out distribution
    glitterRef.current = Array.from({ length: glitterCount }, () => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.pointerEvents = 'none';
      element.style.willChange = 'transform, opacity';
      const color = glitterColors[Math.floor(Math.random() * glitterColors.length)];
      element.style.background = color;
      
      // Random shape - mix of circles and squares for variety
      if (Math.random() > 0.5) {
        element.style.borderRadius = '50%';
      } else {
        element.style.borderRadius = '2px';
      }
      
      containerRef.current!.appendChild(element);

      // Spread glitter more toward edges using quadratic distribution
      const getSpreadValue = () => {
        const rand = Math.random();
        return rand < 0.5 ? rand * rand * 200 - 100 : 100 - (1 - rand) * (1 - rand) * 200;
      };

      return {
        x: getSpreadValue(),
        y: getSpreadValue(),
        z: Math.random() * 500 - 250,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: Math.random() * 0.1 + 0.1, // Slight downward drift
        speedZ: (Math.random() - 0.5) * 0.4,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        color,
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

      glitterRef.current.forEach((g) => {
        // Update positions with floating and falling motion
        g.x += g.speedX;
        g.y += g.speedY;
        g.z += g.speedZ;
        g.rotation += g.rotationSpeed;

        // Wrap around at boundaries for continuous effect
        if (g.y > 100) {
          g.y = -100;
          g.x = (Math.random() - 0.5) * 200;
        }
        if (Math.abs(g.x) > 100) g.speedX *= -1;
        if (Math.abs(g.z) > 250) g.speedZ *= -1;

        // Clamp positions
        g.x = Math.max(-100, Math.min(100, g.x));
        g.z = Math.max(-250, Math.min(250, g.z));

        // Update twinkle phase for sparkling effect
        g.twinklePhase += g.twinkleSpeed;

        // Calculate depth-based scale and twinkling
        const scale = 1 + g.z / 250;
        const twinkle = (Math.sin(g.twinklePhase) + 1) / 2; // 0 to 1
        const opacity = 0.4 + twinkle * 0.4;
        const size = (2 + twinkle * 2) * scale;

        // Apply parallax offset based on depth
        const parallaxX = mousePos.current.x * (g.z / 500);
        const parallaxY = mousePos.current.y * (g.z / 500);

        // Create sparkle effect with box-shadow
        const sparkleIntensity = twinkle * 6;
        
        // Update glitter appearance with rotation, twinkle, and sparkle
        g.element.style.width = `${size}px`;
        g.element.style.height = `${size}px`;
        g.element.style.opacity = `${opacity}`;
        g.element.style.boxShadow = `0 0 ${sparkleIntensity}px ${sparkleIntensity / 2}px ${g.color}`;
        g.element.style.transform = `translate3d(${(g.x + parallaxX) * scale}px, ${(g.y + parallaxY) * scale}px, ${g.z}px) translate(-50%, -50%) rotate(${g.rotation}deg)`;
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
      // Clean up glitter elements
      glitterRef.current.forEach((g) => g.element.remove());
      glitterRef.current = [];
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
