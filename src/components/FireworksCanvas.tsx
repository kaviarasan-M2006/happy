import React, { useEffect, useRef } from 'react';

interface FireworksCanvasProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

interface Rocket {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
}

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const animationRef = useRef<number | null>(null);

  const colors = [
    '#FF3366', '#FF9933', '#FFFF33', '#33CCFF', '#33FF33',
    '#CC33FF', '#FF00CC', '#00FFFF', '#FF5050'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const spawnRocket = () => {
      if (!canvas) return;
      const x = Math.random() * (canvas.width - 200) + 100;
      const y = canvas.height;
      const tx = Math.random() * (canvas.width - 200) + 100;
      const ty = Math.random() * (canvas.height / 2) + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const angle = Math.atan2(ty - y, tx - x);
      const speed = Math.random() * 5 + 10;

      rocketsRef.current.push({
        x,
        y,
        tx,
        ty,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        exploded: false
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const particleCount = Math.random() * 40 + 40;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.05
        });
      }
    };

    let lastRocketTime = 0;

    const draw = (timestamp: number) => {
      if (!ctx || !canvas) return;

      // Semi-transparent black clear to create trailing glow effect
      ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (active && timestamp - lastRocketTime > 800) {
        spawnRocket();
        lastRocketTime = timestamp;
      }

      // Update and draw rockets
      const rockets = rocketsRef.current;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        // Draw rocket path / trail
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = r.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check if rocket has reached target height
        if (r.vy >= 0 || r.y <= r.ty) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.alpha * 3), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 98,
        mixBlendMode: 'screen'
      }}
    />
  );
};
