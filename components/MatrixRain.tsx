
import React, { useEffect, useRef } from 'react';

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    // Gothic/Runes characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const charArr = chars.split('');
    
    const fontSize = 14;
    const columns = width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random negative positions
    }

    const draw = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(15, 5, 24, 0.05)'; // Deep purple background fade
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'UnifrakturMaguntia', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        
        // Random coloring for "glitch" effect
        const randomColor = Math.random();
        if (randomColor > 0.98) {
            ctx.fillStyle = '#fff'; // White glint
        } else if (randomColor > 0.9) {
            ctx.fillStyle = '#06b6d4'; // Cyan
        } else {
            ctx.fillStyle = '#d946ef'; // Fuchsia/Purple
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};
