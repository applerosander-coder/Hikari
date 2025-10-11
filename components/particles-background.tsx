'use client';

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: any) => {
    console.log('Particles loaded');
  };

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: false,
          },
        },
      },
      particles: {
        color: {
          value: theme === "dark" ? "#ffffff" : "#000000",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "top" as const,
          enable: true,
          outModes: {
            default: "out" as const,
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 40,
        },
        opacity: {
          value: 0.2,
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
            minimumValue: 0,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 5, max: 15 },
          animation: {
            enable: true,
            speed: 2,
            sync: false,
            minimumValue: 5,
          },
        },
      },
      detectRetina: true,
      fullScreen: {
        enable: false,
      },
    }),
    [theme],
  );

  if (!init) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0" style={{
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
    }}>
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}
