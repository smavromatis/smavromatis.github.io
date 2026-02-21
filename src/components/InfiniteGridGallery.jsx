import React, { useRef, useState, useEffect } from 'react'
import { useGesture } from '@use-gesture/react'

export default function InfiniteGridGallery({ images = [], onInteraction }) {
    const containerRef = useRef(null)
    const [activeImage, setActiveImage] = useState(null)
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
                            setActiveImage(photo)
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
                className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl transition-all duration-300 ${activeImage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setActiveImage(null)}
            >
                {activeImage && (
                    <div className="relative flex items-center justify-center w-full h-full">
                        <img
                            src={activeImage.srcOriginal || activeImage.src || activeImage}
                            alt="Expanded view"
                            className="w-auto h-auto max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 protect-photo"
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={e => e.stopPropagation()}
                            style={{
                                animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                            }}
                        />
                        <button
                            className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/20 active:bg-white/30 text-white backdrop-blur-xl transition-all border border-white/10"
                            onClick={() => setActiveImage(null)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    )
}
