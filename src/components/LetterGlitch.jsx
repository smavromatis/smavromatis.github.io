import { useRef, useEffect, useState, useMemo } from 'react';

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const letters = useRef([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef(null);
  const lastGlitchTime = useRef(Date.now());
  const cachedDimensions = useRef({ width: 0, height: 0 });
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);

  const isLowEndDevice = typeof window !== 'undefined' && localStorage.getItem('isLowEndDevice') === 'true';

  // Memoize character array to avoid recreation on every render
  const lettersAndSymbols = useMemo(() => Array.from(characters), [characters]);

  // Pre-convert hex colors to RGB once to avoid repeated conversions
  const rgbColors = useMemo(() => {
    return glitchColors.map(hex => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        hex: hex
      } : null;
    }).filter(Boolean);
  }, [glitchColors]);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return rgbColors[Math.floor(Math.random() * rgbColors.length)];
  };

  const interpolateColor = (start, end, factor) => {
    return {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor)
    };
  };

  const colorToString = (color) => {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  };

  const calculateGrid = (width, height) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns, rows) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1
    }));
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Cache dimensions for later use
    cachedDimensions.current = { width, height };

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(width, height);
    initializeLetters(columns, rows);

    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0) return;
    const ctx = context.current;
    const { width, height } = cachedDimensions.current;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = colorToString(letter.color);
      ctx.fillText(letter.char, x, y);
    });
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      letters.current[index].char = getRandomChar();

      if (!smooth) {
        letters.current[index].color = getRandomColor();
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].targetColor = getRandomColor();
        letters.current[index].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach(letter => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        letter.color = interpolateColor(letter.color, letter.targetColor, letter.colorProgress);
        needsRedraw = true;
      }
    });

    if (needsRedraw) {
      drawLetters();
    }
  };

  const animate = () => {
    if (!isMountedRef.current) return;

    const now = Date.now();
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = now;
    }

    if (smooth) {
      handleSmoothTransitions();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    isMountedRef.current = true;
    context.current = canvas.getContext('2d');
    if (isMountedRef.current) setIsVisible(false);

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Optimized initialization: resize twice then start
    requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      resizeCanvas();
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        resizeCanvas();
        // Final resize and fade-in after brief delay
        const finalTimeout = setTimeout(() => {
          if (!isMountedRef.current) return;
          resizeCanvas();
          if (isMountedRef.current) setIsVisible(true);
          animate();
        }, 100);
        timeoutsRef.current.push(finalTimeout);
      });
    });

    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!isMountedRef.current) return;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animate();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMountedRef.current = false;

      // Cancel animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      clearTimeout(resizeTimeout);

      // Remove event listener
      window.removeEventListener('resize', handleResize);

      // Clear references
      letters.current = [];
      context.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth]);

  if (isLowEndDevice) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0F0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 300ms ease-in'
        }}
      />
      {outerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]"></div>
      )}
      {centerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]"></div>
      )}
    </div>
  );
};

export default LetterGlitch;

