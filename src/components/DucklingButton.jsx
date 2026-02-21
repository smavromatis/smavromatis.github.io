import React, { useState, useEffect } from 'react';
import GlassSurface from '@/components/GlassSurface';

// Minimal pixel duckling SVG component with walking animation
const PixelDuckling = ({ direction = 'right' }) => (
    <>
        <style>
            {`
                .duck-head { transform-origin: 50% 50%; }
                
                .is-walking .duck-head {
                    animation: duckHeadBob 0.3s infinite alternate steps(2);
                }
                .is-walking .duck-foot-l {
                    animation: feetWalkLeft 0.3s infinite alternate steps(2);
                }
                .is-walking .duck-foot-r {
                    animation: feetWalkRight 0.3s infinite alternate-reverse steps(2);
                }

                @keyframes duckHeadBob {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(1px); }
                }
                @keyframes feetWalkLeft {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-1px) translateX(1px); }
                }
                @keyframes feetWalkRight {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-1px) translateX(1px); }
                }
            `}
        </style>
        <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'none' }}>
            {/* Feet */}
            <g>
                <rect className="duck-foot-l" x="4" y="10" width="2" height="1" fill="#FFA500" />
                <rect className="duck-foot-r" x="7" y="10" width="2" height="1" fill="#FFA500" />
            </g>

            {/* Body */}
            <g>
                <rect x="3" y="6" width="7" height="1" fill="#FFD700" />
                <rect x="2" y="7" width="9" height="1" fill="#FFD700" />
                <rect x="5" y="7" width="3" height="1" fill="#FFC107" />
                <rect x="2" y="8" width="8" height="1" fill="#FFD700" />
                <rect x="4" y="8" width="4" height="1" fill="#FFC107" />
                <rect x="4" y="9" width="5" height="1" fill="#FFD700" />
                <rect x="4" y="9" width="4" height="1" fill="#FFC107" />
            </g>

            {/* Head */}
            <g className="duck-head">
                <rect x="6" y="2" width="4" height="1" fill="#FFD700" />
                <rect x="5" y="3" width="5" height="1" fill="#FFD700" />
                <rect x="5" y="4" width="3" height="1" fill="#FFD700" />
                <rect x="8" y="4" width="1" height="1" fill="#000000" />
                <rect x="9" y="4" width="1" height="1" fill="#FFD700" />
                <rect x="5" y="5" width="5" height="1" fill="#FFD700" />
                <rect x="10" y="5" width="2" height="1" fill="#FF8C00" />
            </g>
        </svg>
    </>
);

// Minimal pixel chinchilla SVG component with walking animation
const PixelChinchilla = ({ direction = 'right' }) => (
    <>
        <style>
            {`
                .chin-head { transform-origin: 50% 50%; }
                
                .is-walking .chin-head {
                    animation: chinHeadBob 0.3s infinite alternate steps(2);
                }
                .is-walking .chin-foot-l {
                    animation: feetWalkLeft 0.3s infinite alternate steps(2);
                }
                .is-walking .chin-foot-r {
                    animation: feetWalkRight 0.3s infinite alternate-reverse steps(2);
                }

                @keyframes chinHeadBob {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(1px); }
                }
            `}
        </style>
        <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'none' }}>
            {/* Tail */}
            <g>
                <rect x="1" y="5" width="2" height="1" fill="#6B7280" />
                <rect x="0" y="6" width="2" height="3" fill="#6B7280" />
                <rect x="1" y="9" width="2" height="1" fill="#6B7280" />
            </g>

            {/* Feet */}
            <g>
                <rect className="chin-foot-l" x="4" y="10" width="2" height="1" fill="#F472B6" />
                <rect className="chin-foot-r" x="7" y="10" width="2" height="1" fill="#F472B6" />
            </g>

            {/* Body */}
            <g>
                <rect x="3" y="6" width="6" height="1" fill="#9CA3AF" />
                <rect x="2" y="7" width="8" height="1" fill="#9CA3AF" />
                <rect x="5" y="7" width="3" height="1" fill="#E5E7EB" />
                <rect x="2" y="8" width="8" height="1" fill="#9CA3AF" />
                <rect x="5" y="8" width="4" height="1" fill="#E5E7EB" />
                <rect x="3" y="9" width="6" height="1" fill="#9CA3AF" />
                <rect x="5" y="9" width="3" height="1" fill="#E5E7EB" />
            </g>

            {/* Head */}
            <g className="chin-head">
                {/* Ears */}
                <rect x="4" y="1" width="1" height="3" fill="#6B7280" />
                <rect x="6" y="0" width="2" height="3" fill="#9CA3AF" />
                <rect x="7" y="1" width="1" height="2" fill="#F472B6" />

                {/* Face */}
                <rect x="4" y="3" width="5" height="1" fill="#9CA3AF" />
                <rect x="4" y="4" width="4" height="1" fill="#9CA3AF" />
                <rect x="8" y="4" width="1" height="1" fill="#000000" />
                <rect x="9" y="4" width="1" height="1" fill="#9CA3AF" />
                <rect x="4" y="5" width="5" height="1" fill="#9CA3AF" />
                <rect x="9" y="5" width="1" height="1" fill="#F472B6" />
            </g>
        </svg>
    </>
);

const DucklingInstance = ({ startRight, startBottom, type = 'duck', isFadingOut }) => {
    const duckRef = React.useRef(null);

    useEffect(() => {
        let animationFrame;
        let lastTime = performance.now();

        // Settings for duck behavior
        const speed = 25; // pixels per second
        const maxWanderOffset = 150; // max horizontal distance from start
        const maxWanderHeight = 30; // max vertical distance

        let currentRight = startRight;
        let currentBottom = startBottom;

        let targetRight = startRight;
        let targetBottom = startBottom;

        let pauseTime = 0; // seconds to pause
        let currentDirection = 'left'; // initial visual state
        let wasWalking = false;

        const animate = (timestamp) => {
            const dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            const isWalking = pauseTime <= 0;

            if (pauseTime > 0) {
                pauseTime -= dt;
            } else {
                // Determine distance to target
                const dx = targetRight - currentRight;
                const dy = targetBottom - currentBottom;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 2) {
                    // Reached target, pick a new one and pause
                    pauseTime = Math.random() * 3 + 1; // pause for 1-4 seconds
                    targetRight = startRight + (Math.random() * 2 - 1) * maxWanderOffset;
                    targetBottom = startBottom + (Math.random() * 2 - 1) * maxWanderHeight;

                    // Face new direction based on right offset changing
                    // (targetRight < currentRight means it's moving RIGHT on the screen)
                    const newDir = targetRight < currentRight ? 'right' : 'left';
                    if (newDir !== currentDirection) {
                        currentDirection = newDir;
                        if (duckRef.current) {
                            const svg = duckRef.current.querySelector('svg');
                            if (svg) {
                                svg.style.transform = currentDirection === 'left' ? 'scaleX(-1)' : 'none';
                            }
                        }
                    }
                } else {
                    // Move towards target
                    const moveDist = speed * dt;
                    const ratio = Math.min(moveDist / dist, 1);
                    currentRight += dx * ratio;
                    currentBottom += dy * ratio;
                }
            }

            if (duckRef.current) {
                duckRef.current.style.right = `${currentRight}px`;
                duckRef.current.style.bottom = `${currentBottom}px`;

                if (isWalking !== wasWalking) {
                    if (isWalking) {
                        duckRef.current.classList.add('is-walking');
                    } else {
                        duckRef.current.classList.remove('is-walking');
                    }
                    wasWalking = isWalking;
                }
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [startRight, startBottom]);

    return (
        <div
            ref={duckRef}
            className={`fixed z-[60] pointer-events-none duckling-keep ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
                right: `${startRight}px`,
                bottom: `${startBottom}px`,
                transform: `translateY(0px)`,
                transition: 'opacity 1s ease'
            }}
        >
            <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
                {type === 'chinchilla' ? <PixelChinchilla /> : <PixelDuckling />}
            </div>
        </div>
    );
};

export default function DucklingButton({ isMobile }) {
    const [isHovered, setIsHovered] = useState(false);
    const [ducklings, setDucklings] = useState([]);
    const [ducklingIdCounter, setDucklingIdCounter] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [fps, setFps] = useState(0);

    const isStressTest = ducklings.length > 10;
    const isVisibleStressTest = isStressTest && !isFadingOut;

    // FPS Counter
    useEffect(() => {
        if (!isVisibleStressTest) return;
        let frameCount = 0;
        let lastTime = performance.now();
        let animationFrameId;

        const updateFps = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(Math.round((frameCount * 1000) / (now - lastTime)));
                frameCount = 0;
                lastTime = now;
            }
            animationFrameId = requestAnimationFrame(updateFps);
        };

        animationFrameId = requestAnimationFrame(updateFps);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isVisibleStressTest]);

    // Auto-clear cache and fade out if user stops clicking for 2.5 seconds
    useEffect(() => {
        if (isStressTest && !isFadingOut) {
            const timer = setTimeout(() => {
                setIsFadingOut(true);
                setTimeout(() => {
                    setDucklings([]);
                    setIsFadingOut(false);
                    setMultiplier(1);
                }, 1000); // Wait for CSS opacity transition
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [ducklings, isFadingOut, isStressTest]);

    useEffect(() => {
        if (isVisibleStressTest) {
            document.body.classList.add('stress-test-mode');
        } else {
            document.body.classList.remove('stress-test-mode');
        }
        return () => document.body.classList.remove('stress-test-mode');
    }, [isVisibleStressTest]);

    const spawnDuckling = () => {
        const now = performance.now();
        let currentMultiplier = 1;

        if (isVisibleStressTest) {
            if (now - lastClickTime < 1000) {
                currentMultiplier = multiplier + 1;
                setMultiplier(currentMultiplier);
            } else {
                setMultiplier(1);
            }
        }
        setLastClickTime(now);

        const newEntities = [];
        let currentId = ducklingIdCounter + 1;

        for (let i = 0; i < currentMultiplier; i++) {
            const isChinchilla = Math.random() < 0.2; // 1/5 chance
            newEntities.push({
                id: currentId++,
                type: isChinchilla ? 'chinchilla' : 'duck',
                startRight: (isMobile ? 100 : 124) + (Math.random() * 40 - 20),
                startBottom: (isMobile ? 96 : 24) + (Math.random() * 40 - 20)
            });
        }

        setDucklingIdCounter(currentId - 1);
        setDucklings(prev => [...prev, ...newEntities]);
    };

    return (
        <>
            <style>
                {`
                    .fixed.inset-0.z-0, .fixed.inset-0.z-5, #main-app-content > *:not(.duckling-keep) {
                        transition: opacity 1s ease-in-out !important;
                    }
                    body.stress-test-mode .fixed.inset-0.z-0 { opacity: 0.1 !important; }
                    body.stress-test-mode .fixed.inset-0.z-5 { opacity: 0 !important; }
                    body.stress-test-mode #main-app-content > *:not(.duckling-keep) {
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                `}
            </style>

            <div
                className={`fixed top-4 right-5 sm:top-6 sm:right-8 z-[70] duckling-keep pointer-events-none transition-all duration-1000 ${isVisibleStressTest ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
                <div className="flex flex-col items-center justify-center">
                    <span
                        className={`font-mono text-xl sm:text-2xl font-bold transition-colors duration-300 ${fps >= 45 ? 'text-green-400' :
                            fps >= 30 ? 'text-yellow-400' :
                                fps >= 15 ? 'text-orange-400' :
                                    'text-red-500'
                            }`}
                        style={{
                            textShadow: `0 0 12px ${fps >= 45 ? 'rgba(74, 222, 128, 0.5)' :
                                fps >= 30 ? 'rgba(250, 204, 21, 0.5)' :
                                    fps >= 15 ? 'rgba(251, 146, 60, 0.5)' :
                                        'rgba(239, 68, 68, 0.5)'
                                }`
                        }}
                    >
                        {fps}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest mt-1 font-bold" style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
                        FPS
                    </span>
                </div>
            </div>

            <div
                className={`fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none duckling-keep transition-opacity duration-1000 ${isVisibleStressTest ? 'opacity-100' : 'opacity-0'}`}
            >
                {isStressTest && (
                    <div style={{ transform: 'translateY(-20px)' }}>
                        <GlassSurface
                            width={isMobile ? 'min(calc(100vw - 32px), 440px)' : 540}
                            height={420}
                            borderRadius={30}
                            backgroundOpacity={0.15}
                            saturation={1.8}
                            borderWidth={0.1}
                            brightness={60}
                            opacity={0.9}
                            blur={20}
                            displace={1.5}
                            distortionScale={-200}
                            redOffset={0}
                            greenOffset={15}
                            blueOffset={30}
                            style={{ overflow: 'visible' }}
                        >
                            <div
                                className="w-full h-full rounded-[30px] backdrop-blur-sm flex flex-col items-center justify-center p-8 relative"
                                style={{
                                    background: 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)'
                                }}
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-center max-w-[400px] mt-6 sm:mt-0 leading-snug">
                                    It's time to stress your browser's performance, I guess
                                </h2>

                                <div className="flex gap-8 text-center mt-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="font-mono text-4xl sm:text-5xl" style={{ color: '#FFD700', textShadow: '0 0 15px rgba(255, 215, 0, 0.8)' }}>
                                            {ducklings.filter(d => d.type === 'duck').length}
                                        </span>
                                        <span className="text-xs tracking-widest uppercase text-white/60 font-semibold mt-1">Ducklings</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className="font-mono text-4xl sm:text-5xl" style={{ color: '#F472B6', textShadow: '0 0 15px rgba(244, 114, 182, 0.8)' }}>
                                            {ducklings.filter(d => d.type === 'chinchilla').length}
                                        </span>
                                        <span className="text-xs tracking-widest uppercase text-white/60 font-semibold mt-1">Chinchillas</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col items-center gap-1 pt-6 border-t border-white/20 w-full">
                                    <span className="font-mono text-5xl sm:text-6xl text-white" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.8)' }}>
                                        {ducklings.length}
                                    </span>
                                    <span className="text-sm tracking-widest uppercase text-white/50 font-semibold mt-1">Total Entities</span>
                                </div>
                            </div>
                        </GlassSurface>
                    </div>
                )}
            </div>

            <div
                className={`fixed ${isMobile ? 'bottom-24' : 'bottom-4 sm:bottom-6'} z-50 duckling-keep flex flex-col items-center`}
                style={{ right: isMobile ? '100px' : '124px' }}
            >
                {/* Floating Combo Counter */}
                <div
                    className={`absolute pointer-events-none transition-all duration-75 ease-out ${isVisibleStressTest && multiplier > 1 ? 'opacity-100' : 'opacity-0 translate-y-4'}`}
                    style={{
                        top: '-60px',
                        transform: isVisibleStressTest && multiplier > 1
                            ? `scale(${1 + Math.min(1.5, multiplier * 0.05)}) rotate(${(multiplier % 2 === 0 ? 1 : -1) * Math.min(12, 2 + multiplier * 0.5)}deg)`
                            : 'scale(0.5)',
                    }}
                >
                    <span
                        className="font-mono font-bold text-white/50"
                        style={{
                            fontSize: '2.5rem',
                            textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 4px 10px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        x{multiplier}
                    </span>
                </div>
                <button
                    onMouseEnter={() => !isMobile && setIsHovered(true)}
                    onMouseLeave={() => !isMobile && setIsHovered(false)}
                    onTouchStart={() => setIsHovered(true)}
                    onTouchEnd={() => setIsHovered(false)}
                    onClick={spawnDuckling}
                    className="transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Spawn Duckling"
                    style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div
                        className="flex items-center justify-center p-2.5 rounded-full backdrop-blur-md transition-all duration-500"
                        style={{
                            background: isHovered
                                ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.3), rgba(255, 215, 0, 0.2))'
                                : 'rgba(255, 255, 255, 0.05)',
                            boxShadow: isHovered
                                ? '0 0 20px rgba(255, 165, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.3), inset 0 0 10px rgba(255, 165, 0, 0.2)'
                                : 'none'
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-500"
                            style={{
                                opacity: isHovered ? 1 : 0.7,
                                stroke: isHovered ? '#FFA500' : 'white',
                                filter: isHovered
                                    ? 'drop-shadow(0 0 6px rgba(255, 165, 0, 0.8))'
                                    : 'none'
                            }}
                        >
                            <path d="M12 22c5 0 8-4 8-9s-4-11-8-11-8 6-8 11 3 9 8 9z" vectorEffect="non-scaling-stroke"></path>
                        </svg>
                    </div>
                </button>
            </div>

            {ducklings.map(duck => (
                <DucklingInstance
                    key={duck.id}
                    id={duck.id}
                    type={duck.type}
                    startRight={duck.startRight}
                    startBottom={duck.startBottom}
                    isFadingOut={isFadingOut}
                />
            ))}
        </>
    )
}
