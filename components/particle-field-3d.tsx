'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function ParticleField({ color }: { color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    
    for (let i = 0; i < 1500; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 5;
    }
    
    return positions;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state: any) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    
    pointsRef.current.rotation.x = time * 0.05;
    pointsRef.current.rotation.y = time * 0.075;
    
    pointsRef.current.position.x = mousePos.current.x * 0.5;
    pointsRef.current.position.y = mousePos.current.y * 0.5;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      positions[i + 1] = y + Math.sin(time + i) * 0.002;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

export default function ParticleField3D() {
  const { theme } = useTheme();
  const color = theme === 'dark' ? '#ffffff' : '#000000';

  return (
    <div className="absolute inset-0 z-0" style={{
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
    }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        className="w-full h-full"
        gl={{ alpha: true, antialias: true }}
      >
        <ParticleField color={color} />
      </Canvas>
    </div>
  );
}
