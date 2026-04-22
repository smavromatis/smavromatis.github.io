import React, { useRef, useState, useEffect } from 'react'
import { useGesture } from '@use-gesture/react'

export default function InfiniteGridGallery({ images = [], onInteraction }) {
    const containerRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(null)
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 })

    const offset = useRef({ x: 0, y: 0 })
    const velocity = useRef({ x: 0, y: 0 })
    const dragging = useRef(false)
    const rafRef = useRef(null)
    const loopRef = useRef(null)

    // Grid config
    const isBrowser = typeof window !== 'undefined'
    const itemSizeX = isBrowser ? Math.min(160, window.innerWidth / 2 - 24) : 160
    const itemSizeY = itemSizeX
    const gap = 12
    const cellX = itemSizeX + gap
    const cellY = itemSizeY + gap

    const [, setRenderTick] = useState(0)

    const isLowEndDevice = typeof window !== 'undefined' && localStorage.getItem('isLowEndDevice') === 'true';

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                w: containerRef.current.offsetWidth,
                h: containerRef.current.offsetHeight
            })
        }

        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                setDimensions({
                    w: entries[0].contentRect.width,
                    h: entries[0].contentRect.height
                })
            }
        })

        if (containerRef.current) observer.observe(containerRef.current)

        const updateLoop = () => {
            if (!dragging.current) {
                // Apply inertia
                offset.current.x += velocity.current.x
                offset.current.y += velocity.current.y

                // Friction
                velocity.current.x *= 0.92
                velocity.current.y *= 0.92

                // Threshold to stop rendering and save CPU
                if (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.y) > 0.1) {
                    setRenderTick(t => t + 1)
                    rafRef.current = requestAnimationFrame(updateLoop)
                } else {
                    rafRef.current = null
                }
            } else {
                rafRef.current = null
            }
        }

        loopRef.current = updateLoop

        return () => {
            observer.disconnect()
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    const bind = useGesture(
        {
            onDrag: (state) => {
                // Prevent background grid movement if lightbox is open
                if (activeIndex !== null) return

                const { delta, velocity: vel, direction, dragging: isDragging } = state
                if (onInteraction) onInteraction()

                dragging.current = isDragging

                const dx = delta[0] || 0
                const dy = delta[1] || 0

                offset.current.x += dx
                offset.current.y += dy

                if (!isDragging) {
                    // Start inertia on release
                    const vx = vel[0] || 0
                    const vy = vel[1] || 0
                    const dirX = direction[0] || 0
                    const dirY = direction[1] || 0
                    velocity.current.x = vx * dirX * 18
                    velocity.current.y = vy * dirY * 18

                    if (!rafRef.current && loopRef.current) {
                        rafRef.current = requestAnimationFrame(loopRef.current)
                    }
                } else {
                    velocity.current.x = 0
                    velocity.current.y = 0
                    if (rafRef.current) {
                        cancelAnimationFrame(rafRef.current)
                        rafRef.current = null
                    }
                }

                setRenderTick(t => t + 1)
            },
            onDragStart: () => {
                if (activeIndex !== null) return
                dragging.current = true
                velocity.current.x = 0
                velocity.current.y = 0
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current)
                    rafRef.current = null
                }
            },
            onDragEnd: () => {
                dragging.current = false
            }
        },
        {
            drag: { filterTaps: true, rubberband: false }
        }
    )

    // Lightbox State
    const [dragX, setDragX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [dotsTop, setDotsTop] = useState(0)
    const lastIndexRef = useRef(0)

    if (activeIndex !== null) {
        lastIndexRef.current = activeIndex;
    }

    const displayIndex = activeIndex !== null ? activeIndex : lastIndexRef.current;

    // Dynamically calculate the bottom position of the active image
    useEffect(() => {
        if (activeIndex === null) return;
        
        const imgEl = document.getElementById(`lightbox-img-${activeIndex}`);
        
        const updateDotsPosition = () => {
            if (imgEl) {
                const rect = imgEl.getBoundingClientRect();
                // If rect.bottom is 0 (image not loaded yet), default to center of screen
                if (rect.bottom > 0) {
                    setDotsTop(rect.bottom + 20); // 20px below the image
                } else {
                    setDotsTop(window.innerHeight * 0.85);
                }
            }
        };

        updateDotsPosition();
        
        if (imgEl) {
            imgEl.addEventListener('load', updateDotsPosition);
        }
        window.addEventListener('resize', updateDotsPosition);

        // Small delay to ensure layout is settled after transition
        const timer = setTimeout(updateDotsPosition, 50);

        return () => {
            if (imgEl) imgEl.removeEventListener('load', updateDotsPosition);
            window.removeEventListener('resize', updateDotsPosition);
            clearTimeout(timer);
        };
    }, [activeIndex, dimensions]);

    // Lightbox Swipe Gesture (Physical Track)
    const bindLightbox = useGesture(
        {
            onDrag: ({ down, movement: [mx], velocity: [vx], direction: [dx], event }) => {
                if (event) event.stopPropagation()
                setIsDragging(down)
                if (down) {
                    setDragX(mx)
                } else {
                    setDragX(0)
                    if (Math.abs(mx) > 50 || Math.abs(vx) > 0.5) {
                        if (dx > 0 && activeIndex > 0) {
                            setActiveIndex(activeIndex - 1)
                        } else if (dx < 0 && activeIndex < images.length - 1) {
                            setActiveIndex(activeIndex + 1)
                        }
                    }
                }
            }
        },
        { drag: { filterTaps: true, axis: 'x', rubberband: true } }
    )

    const prevActiveIndex = useRef(null)
    const justOpened = activeIndex !== null && prevActiveIndex.current === null
    
    useEffect(() => {
        prevActiveIndex.current = activeIndex;
    })

    const renderCells = () => {
        if (dimensions.w === 0 || dimensions.h === 0 || !images || images.length === 0) return null

        // Add padding to generation so scrolling fast doesn't show blank edges
        const pad = Math.max(cellX, cellY) * 1.5

        // Current offset translation bounds
        const startCol = Math.floor((-pad - offset.current.x) / cellX)
        const endCol = Math.ceil((dimensions.w + pad - offset.current.x) / cellX)

        const startRow = Math.floor((-pad - offset.current.y) / cellY)
        const endRow = Math.ceil((dimensions.h + pad - offset.current.y) / cellY)

        const cells = []

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                // Create a deterministic pseudo-random hash for index selection
                const hash = Math.abs(Math.imul(c, 10007) + Math.imul(r, 100003))
                const imgIndex = hash % images.length

                const photo = images[imgIndex]
                if (!photo) continue

                const xPos = c * cellX + offset.current.x
                const yPos = r * cellY + offset.current.y

                cells.push(
                    <div
                        key={`${c}-${r}`}
                        className="absolute rounded-2xl overflow-hidden cursor-pointer bg-white/5 active:scale-95 group shadow-lg pointer-events-auto"
                        style={{
                            width: itemSizeX,
                            height: itemSizeY,
                            transform: `translate3d(${xPos}px, ${yPos}px, 0)`,
                            willChange: 'transform',
                            transition: 'opacity 0.3s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            setActiveIndex(imgIndex)
                        }}
                    >
                        <div className="absolute inset-0 bg-black/10 group-active:bg-black/0 transition-colors z-10 pointer-events-none" />
                        <img
                            src={photo.src || photo}
                            alt={photo.alt || ''}
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-full object-cover select-none pointer-events-none protect-photo"
                            draggable={false}
                            loading="lazy"
                        />
                    </div>
                )
            }
        }

        return cells
    }

    if (isLowEndDevice) {
        return (
            <div 
                className="w-full h-full overflow-y-auto p-4 pb-32 overscroll-contain"
                style={{ paddingTop: typeof window !== 'undefined' && window.innerWidth < 768 ? 'var(--mob-back-clearance, 72px)' : '16px' }}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[160px] sm:auto-rows-[220px] max-w-[1400px] mx-auto">
                    {images.map((img, i) => {
                        const src = img.src || img;
                        const srcOriginal = img.srcOriginal || src;
                        const alt = img.alt || '';
                        return (
                            <div
                                key={i}
                                className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer"
                                onClick={() => {
                                    if (srcOriginal) window.open(srcOriginal, '_blank');
                                }}
                            >
                                <img
                                    src={src}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none protect-photo"
                                    alt={alt}
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    const isLightboxOpen = activeIndex !== null;

    return (
        <div
            {...bind()}
            className="w-full h-full relative overflow-hidden touch-none"
            ref={containerRef}
            style={{ touchAction: 'none' }}
        >
            <div className="absolute inset-0 z-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 20%, rgba(0,0,0,0.5) 100%)'
            }} />

            {renderCells()}

            {/* Lightbox Overlay */}
            <div
                className={`fixed inset-0 z-[100] transition-all duration-400 ${isLightboxOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ 
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: isLightboxOpen ? 'blur(20px)' : 'blur(0px)',
                    WebkitBackdropFilter: isLightboxOpen ? 'blur(20px)' : 'blur(0px)',
                    touchAction: 'none' 
                }}
            >
                {/* Physical Swipe Track */}
                <div 
                    {...bindLightbox()}
                    className="absolute inset-0 flex items-center h-full w-full outline-none"
                    style={{
                        // 90vw per slide + 5vw padding on the left to perfectly center the active slide
                        paddingLeft: '5vw',
                        transform: `translate3d(calc(${-displayIndex * 90}vw + ${dragX}px), 0, 0)`,
                        transition: (isDragging || justOpened) ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        willChange: 'transform',
                        touchAction: 'none'
                    }}
                >
                    {images.map((photo, i) => (
                        <div 
                            key={i} 
                            className="flex-shrink-0 flex flex-col items-center justify-center h-full relative"
                            style={{ width: '90vw' }}
                            onClick={() => {
                                // If they click an edge preview, go to it
                                if (i !== activeIndex) {
                                    setActiveIndex(i);
                                } else {
                                    // Click the active slide to close it!
                                    setActiveIndex(null);
                                }
                            }}
                        >
                            <img
                                id={`lightbox-img-${i}`}
                                src={photo.srcOriginal || photo.src || photo}
                                alt="Expanded view"
                                className={`w-auto h-auto max-w-[85vw] max-h-[75vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 protect-photo transition-transform duration-500 ${i === displayIndex ? 'scale-100' : 'scale-95 opacity-50'}`}
                                onContextMenu={(e) => e.preventDefault()}
                                draggable={false}
                                style={{
                                    animation: isLightboxOpen ? 'zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Persistent Mobile Swipe Hints (Dots) positioned dynamically below the active image */}
                <div 
                    className="absolute left-0 right-0 flex justify-center pointer-events-none"
                    style={{
                        top: dotsTop ? `${dotsTop}px` : '85vh',
                        transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        willChange: 'top'
                    }}
                >
                    <div className="flex gap-1.5 opacity-60">
                        {images.slice(0, Math.min(images.length, 12)).map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === (displayIndex % 12) ? 'w-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/40'}`} 
                            />
                        ))}
                    </div>
                </div>

                {/* Close Overlay Trigger (clicks outside the images) */}
                <div 
                    className="absolute inset-0 z-[-1]" 
                    onClick={() => setActiveIndex(null)}
                />
            </div>
            <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    )
}
