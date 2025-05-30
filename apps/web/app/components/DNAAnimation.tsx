"use client";
import { useEffect, useRef } from 'react';

export default function DNAAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;

    // Function to resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      
      // Reset transform and scale for DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Initial resize
    resizeCanvas();

    // DNA strand properties
    const strands = [
      { x: 100, baseY: 50, letters: ['A', 'C', 'T', 'G', 'A', 'T', 'C', 'G'], offset: 0 },
      { x: 250, baseY: 100, letters: ['G', 'T', 'A', 'C', 'G', 'C', 'T', 'A'], offset: 1 },
      { x: 400, baseY: 80, letters: ['C', 'G', 'A', 'T', 'C', 'A', 'G', 'T'], offset: 2 },
      { x: window.innerWidth - 400, baseY: 60, letters: ['T', 'A', 'G', 'C', 'T', 'G', 'A', 'C'], offset: 3 },
      { x: window.innerWidth - 250, baseY: 120, letters: ['A', 'T', 'C', 'G', 'A', 'C', 'T', 'G'], offset: 4 },
      { x: window.innerWidth - 100, baseY: 90, letters: ['G', 'C', 'T', 'A', 'G', 'T', 'C', 'A'], offset: 5 },
    ];

    let animationFrame = 0;

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw each DNA strand
      strands.forEach((strand, strandIndex) => {
        const waveAmplitude = 40;
        const waveSpeed = 0.02;
        const letterSpacing = 60;
        
        // Draw main strand
        ctx.beginPath();
        ctx.strokeStyle = strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.4)' : 'rgba(188, 101, 241, 0.4)';
        ctx.lineWidth = 2;

        for (let i = 0; i < strand.letters.length; i++) {
          const x = strand.x + Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
          const y = strand.baseY + i * letterSpacing;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Draw letters
          ctx.save();
          ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillStyle = strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.7)' : 'rgba(188, 101, 241, 0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(strand.letters[i], x, y);
          ctx.restore();

          // Draw nodes
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.5)' : 'rgba(188, 101, 241, 0.5)';
          ctx.fill();
          ctx.restore();
        }

        ctx.stroke();

        // Draw complementary strand
        ctx.beginPath();
        ctx.strokeStyle = strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.4)' : 'rgba(95, 92, 255, 0.4)';

        for (let i = 0; i < strand.letters.length; i++) {
          const x = strand.x - Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
          const y = strand.baseY + i * letterSpacing;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Draw complementary letters
          ctx.save();
          ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillStyle = strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.7)' : 'rgba(95, 92, 255, 0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const complement = strand.letters[i] === 'A' ? 'T' : 
                            strand.letters[i] === 'T' ? 'A' : 
                            strand.letters[i] === 'G' ? 'C' : 'G';
          ctx.fillText(complement, x, y);
          ctx.restore();

          // Connection lines
          if (i % 2 === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            const x1 = strand.x + Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
            const x2 = strand.x - Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.stroke();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

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
        opacity: 0.15,
        zIndex: 1,
      }}
    />
  );
} 