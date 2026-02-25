import React, { useState, useRef, useEffect } from 'react';

export default function ThoughtOfTheDay({ allThoughts, isMobile, showContent }) {
    const [thoughtOfTheDay, setThoughtOfTheDay] = useState({
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    });
    const [, setThoughtIndex] = useState(0);
    const thoughtTimerRef = useRef(null);

    useEffect(() => {
        if (allThoughts && allThoughts.length > 0) {
            setThoughtOfTheDay(allThoughts[0]);
            setThoughtIndex(0);
        }
    }, [allThoughts]);

    const handleMouseEnterThought = () => {
        if (thoughtTimerRef.current) {
            clearTimeout(thoughtTimerRef.current);
            thoughtTimerRef.current = null;
        }
    };

    const handleMouseLeaveThought = () => {
        if (thoughtTimerRef.current) {
            clearTimeout(thoughtTimerRef.current);
        }
        thoughtTimerRef.current = setTimeout(() => {
            setThoughtIndex(prevIdx => {
                if (allThoughts.length > 1) {
                    const nextIdx = (prevIdx + 1) % allThoughts.length;
                    setThoughtOfTheDay(allThoughts[nextIdx]);
                    return nextIdx;
                }
                return prevIdx;
            });
            thoughtTimerRef.current = null;
        }, 400);
    };

    if (!showContent) return null;

    return (
        <div
            className={`fixed ${isMobile ? 'bottom-20' : 'bottom-4 sm:bottom-8'} left-1/2 -translate-x-1/2 z-10 group pointer-events-auto`}
            style={{
                opacity: showContent ? 1 : 0,
                transition: 'opacity 400ms ease-in-out',
                perspective: '1000px',
                maxWidth: isMobile ? 'calc(100vw - 32px)' : 'auto'
            }}
            onMouseEnter={handleMouseEnterThought}
            onMouseLeave={handleMouseLeaveThought}
        >
            {/* Invisible expanded hitbox for much easier hovering */}
            <div className="absolute -inset-x-16 -inset-y-12 z-0 cursor-default"></div>

            <div
                className="flip-container relative z-10 px-4"
                style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: 'rotateX(0deg)'
                }}
            >
                {/* Front: Label (flips away) */}
                <div
                    className="flex items-center gap-2 cursor-default flip-front"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    <svg
                        className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-white/30 text-xs font-light uppercase tracking-widest group-hover:text-white/50 transition-colors duration-300">
                        quick thought
                    </span>
                </div>

                {/* Back: Quote (flips in) */}
                <div
                    className="absolute top-0 cursor-default flip-back flex flex-col items-center justify-center gap-1"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateX(-50%) rotateX(180deg)',
                        left: '50%',
                        width: 'max-content'
                    }}
                >
                    <p className="text-white/30 text-xs font-light uppercase tracking-widest whitespace-nowrap">
                        "{thoughtOfTheDay.quote}"
                    </p>
                    {thoughtOfTheDay.author && (
                        <p className="text-white/20 text-[10px] font-light uppercase tracking-wider">
                            — {thoughtOfTheDay.author}
                        </p>
                    )}
                </div>
            </div>

            <style>{`
      @media (hover: hover) {
        .group:hover .flip-container {
          transform: rotateX(180deg) !important;
        }
      }
      @media (hover: none) {
        .group:active .flip-container {
          transform: rotateX(180deg) !important;
        }
      }
    `}</style>
        </div>
    );
}
