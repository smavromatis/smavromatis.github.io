import React from 'react'
import GlassSurface from '@/components/GlassSurface'

export default function DragHint() {
    return (
        <>
            <nav
                className="fixed z-50"
                style={{
                    top: 0,
                    left: 0,
                    transform: 'translate(calc(50vw - 50%), calc(50vh - 24px))',
                    willChange: 'transform',
                    overflow: 'visible',
                    pointerEvents: 'none'
                }}
            >
                <GlassSurface
                    width={220}
                    height={48}
                    borderRadius={50}
                    backgroundOpacity={0.05}
                    saturation={1.8}
                    borderWidth={0.1}
                    brightness={80}
                    opacity={0.7}
                    blur={16}
                    displace={1.5}
                    distortionScale={-200}
                    redOffset={0}
                    greenOffset={15}
                    blueOffset={30}
                    style={{
                        overflow: 'visible'
                    }}
                >
                    <div
                        className="w-full h-full rounded-full bg-transparent text-muted-foreground overflow-visible flex items-center"
                        style={{
                            padding: '4px',
                            justifyContent: 'center'
                        }}
                    >
                        <div className="flex items-center gap-3 px-4">
                            {/* Left Arrow */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    animation: 'dragHintSlideLeft 1.5s ease-in-out infinite'
                                }}
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>

                            <span
                                className="text-white text-sm font-semibold whitespace-nowrap"
                                style={{
                                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 0.9)'
                                }}
                            >
                                Drag to rotate
                            </span>

                            {/* Right Arrow */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    animation: 'dragHintSlideRight 1.5s ease-in-out infinite'
                                }}
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </GlassSurface>
            </nav>
            {/* Drag Hint Animations */}
            <style>{`
        @keyframes dragHintSlideLeft {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(-8px); opacity: 0.6; }
        }
        
        @keyframes dragHintSlideRight {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(8px); opacity: 0.6; }
        }
      `}</style>
        </>
    )
}
