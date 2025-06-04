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

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // DNA strand properties - adjust for mobile
    const strands = isMobile ? [
      { x: window.innerWidth * 0.2, baseY: 50, scale: 1, letters: ['A', 'C', 'T', 'G', 'A', 'T'], offset: 0 },
      { x: window.innerWidth * 0.5, baseY: 100, scale: 1.2, letters: ['G', 'T', 'A', 'C', 'G', 'C'], offset: 2 },
      { x: window.innerWidth * 0.8, baseY: 80, scale: 0.9, letters: ['C', 'G', 'A', 'T', 'C', 'A'], offset: 4 },
    ] : [
      { x: window.innerWidth * 0.15, baseY: 50, scale: 1.2, letters: ['A', 'C', 'T', 'G', 'A', 'T', 'C', 'G'], offset: 0 },
      { x: window.innerWidth * 0.3, baseY: 100, scale: 1, letters: ['G', 'T', 'A', 'C', 'G', 'C', 'T', 'A'], offset: 1 },
      { x: window.innerWidth * 0.5, baseY: 80, scale: 1.5, letters: ['C', 'G', 'A', 'T', 'C', 'A', 'G', 'T'], offset: 2 },
      { x: window.innerWidth * 0.7, baseY: 60, scale: 1.1, letters: ['T', 'A', 'G', 'C', 'T', 'G', 'A', 'C'], offset: 3 },
      { x: window.innerWidth * 0.85, baseY: 120, scale: 0.9, letters: ['A', 'T', 'C', 'G', 'A', 'C', 'T', 'G'], offset: 4 },
    ];

    let animationFrame = 0;
    let animationId: number;

    // Animation function
    const animate = () => {
      // Clear canvas with more subtle fade for smoother animation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw each DNA strand
      strands.forEach((strand, strandIndex) => {
        const waveAmplitude = (isMobile ? 30 : 40) * strand.scale;
        const waveSpeed = 0.012; // Slower for smoother motion
        const letterSpacing = (isMobile ? 100 : 80) * strand.scale;
        
        // Draw main strand
        ctx.save();
        
        // Reduce glow for better performance
        if (!isMobile) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.8)' : 'rgba(188, 101, 241, 0.8)';
        }
        
        // Draw main strand path
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.9)' : 'rgba(188, 101, 241, 0.9)');
        gradient.addColorStop(0.5, strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 1)' : 'rgba(188, 101, 241, 1)');
        gradient.addColorStop(1, strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.7)' : 'rgba(188, 101, 241, 0.7)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = (isMobile ? 2 : 3) * strand.scale;

        // Draw smooth curve for strand
        for (let i = 0; i < strand.letters.length; i++) {
          const x = strand.x + Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
          const y = strand.baseY + i * letterSpacing;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = strand.x + Math.sin((animationFrame + (i-1) * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
            const prevY = strand.baseY + (i-1) * letterSpacing;
            const cpX = (prevX + x) / 2;
            const cpY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            ctx.lineTo(x, y);
          }

          // Draw prominent ACTG letters
          ctx.save();
          
          // Letter background glow
          if (!isMobile) {
            ctx.beginPath();
            ctx.arc(x, y, 15 * strand.scale, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 15 * strand.scale);
            glowGradient.addColorStop(0, strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.3)' : 'rgba(188, 101, 241, 0.3)');
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fill();
          }
          
          // Draw letter
          ctx.font = `900 ${(isMobile ? 20 : 24) * strand.scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 15;
          ctx.shadowColor = strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 1)' : 'rgba(188, 101, 241, 1)';
          ctx.fillText(strand.letters[i], x, y);
          
          // Letter outline for better visibility
          ctx.strokeStyle = strandIndex % 2 === 0 ? 'rgba(95, 92, 255, 0.8)' : 'rgba(188, 101, 241, 0.8)';
          ctx.lineWidth = 1;
          ctx.strokeText(strand.letters[i], x, y);
          ctx.restore();

          // Draw nodes
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, (isMobile ? 3 : 5) * strand.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.restore();
        }

        ctx.stroke();
        ctx.restore();

        // Draw complementary strand
        ctx.save();
        
        if (!isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.6)' : 'rgba(95, 92, 255, 0.6)';
        }
        
        ctx.beginPath();
        const gradient2 = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient2.addColorStop(0, strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.7)' : 'rgba(95, 92, 255, 0.7)');
        gradient2.addColorStop(0.5, strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.8)' : 'rgba(95, 92, 255, 0.8)');
        gradient2.addColorStop(1, strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.6)' : 'rgba(95, 92, 255, 0.6)');
        ctx.strokeStyle = gradient2;
        ctx.lineWidth = (isMobile ? 1.5 : 2.5) * strand.scale;

        for (let i = 0; i < strand.letters.length; i++) {
          const x = strand.x - Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
          const y = strand.baseY + i * letterSpacing;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = strand.x - Math.sin((animationFrame + (i-1) * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
            const prevY = strand.baseY + (i-1) * letterSpacing;
            const cpX = (prevX + x) / 2;
            const cpY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            ctx.lineTo(x, y);
          }

          // Draw complementary letters
          ctx.save();
          ctx.font = `900 ${(isMobile ? 18 : 22) * strand.scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 12;
          ctx.shadowColor = strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 1)' : 'rgba(95, 92, 255, 1)';
          const complement = strand.letters[i] === 'A' ? 'T' : 
                            strand.letters[i] === 'T' ? 'A' : 
                            strand.letters[i] === 'G' ? 'C' : 'G';
          ctx.fillText(complement, x, y);
          
          // Complement letter outline
          ctx.strokeStyle = strandIndex % 2 === 0 ? 'rgba(188, 101, 241, 0.8)' : 'rgba(95, 92, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.strokeText(complement, x, y);
          ctx.restore();

          // Connection lines - only on desktop for performance
          if (!isMobile && i % 2 === 0) {
            ctx.save();
            ctx.beginPath();
            const connectionGradient = ctx.createLinearGradient(
              strand.x + Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude,
              y,
              strand.x - Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude,
              y
            );
            connectionGradient.addColorStop(0, 'rgba(200, 200, 200, 0.3)');
            connectionGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            connectionGradient.addColorStop(1, 'rgba(200, 200, 200, 0.3)');
            ctx.strokeStyle = connectionGradient;
            ctx.lineWidth = 1.5 * strand.scale;
            ctx.setLineDash([5, 5]);
            const x1 = strand.x + Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
            const x2 = strand.x - Math.sin((animationFrame + i * 30 + strand.offset * 100) * waveSpeed) * waveAmplitude;
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.stroke();
        ctx.restore();

        // Floating particles - reduce on mobile
        if (!isMobile || strandIndex === 1) {
          for (let j = 0; j < (isMobile ? 1 : 3); j++) {
            const particleX = strand.x + Math.sin(animationFrame * 0.008 + j * 2) * 80;
            const particleY = (animationFrame * 0.3 + j * 100) % window.innerHeight;
            const particleSize = 2 + Math.sin(animationFrame * 0.015 + j) * 1;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            ctx.restore();
          }
        }
      });

      animationFrame += 1;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
      const newIsMobile = window.innerWidth <= 768;
      
      // Update strand positions on resize
      if (newIsMobile) {
        strands[0].x = window.innerWidth * 0.2;
        strands[1].x = window.innerWidth * 0.5;
        strands[2].x = window.innerWidth * 0.8;
      } else {
        strands[0].x = window.innerWidth * 0.15;
        strands[1].x = window.innerWidth * 0.3;
        strands[2].x = window.innerWidth * 0.5;
        strands[3] && (strands[3].x = window.innerWidth * 0.7);
        strands[4] && (strands[4].x = window.innerWidth * 0.85);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
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
        opacity: 0.5,
        zIndex: 1,
      }}
    />
  );
} 