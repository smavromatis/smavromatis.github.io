import React from 'react'
import LetterGlitch from '@/components/LetterGlitch'
import GlassSurface from '@/components/GlassSurface'

export default function HackerDashboard({
    isOpen,
    isClosing,
    onClose,
    showCloseButton
}) {
    if (!isOpen && !isClosing) return null;

    return (
        <div
            className="fixed inset-0 z-[100] overflow-hidden"
            style={{
                animation: isClosing
                    ? 'appleSlideOut 700ms cubic-bezier(0.32, 0.72, 0, 1) forwards'
                    : 'appleSlideIn 700ms cubic-bezier(0.32, 0.72, 0, 1) forwards'
            }}
        >
            <LetterGlitch
                glitchColors={['#2b4539', '#61dca3', '#61b3dc']}
                glitchSpeed={50}
                centerVignette={true}
                outerVignette={false}
                smooth={true}
            />

            <div
                className="fixed z-[101]"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}
            >
                <div style={{ pointerEvents: 'none' }}>
                    <GlassSurface
                        width={280}
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
                            <span
                                className="text-white text-sm font-semibold whitespace-nowrap"
                                style={{
                                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 0.9)'
                                }}
                            >
                                Coming soon...
                            </span>
                        </div>
                    </GlassSurface>
                </div>

                <div
                    style={{
                        pointerEvents: showCloseButton ? 'auto' : 'none',
                        cursor: showCloseButton ? 'pointer' : 'default'
                    }}
                >
                    <GlassSurface
                        width={48}
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
                            onClick={onClose}
                            className="w-full h-full rounded-full bg-transparent flex items-center justify-center transition-all duration-300 hover:scale-110"
                            role="button"
                            aria-label="Close dashboard"
                            tabIndex={showCloseButton ? 0 : -1}
                            style={{
                                opacity: showCloseButton ? 1 : 0,
                                transition: 'opacity 500ms cubic-bezier(0.32, 0.72, 0, 1)'
                            }}
                        >
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
                                    opacity: 0.7,
                                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
                                }}
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                    </GlassSurface>
                </div>
            </div>
        </div>
    )
}
