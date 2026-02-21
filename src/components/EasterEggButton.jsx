import React from 'react'

export default function EasterEggButton({
    isMobile,
    isHovered,
    setIsHovered,
    onClick
}) {
    return (
        <div
            className={`fixed ${isMobile ? 'bottom-24' : 'bottom-4 sm:bottom-6'} z-50`}
            style={{ right: isMobile ? '52px' : '72px' }}
        >
            <button
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
                onClick={onClick}
                className="transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Easter egg"
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
                            ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.3), rgba(21, 128, 61, 0.2))'
                            : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: isHovered
                            ? '0 0 20px rgba(22, 163, 74, 0.5), 0 0 40px rgba(22, 163, 74, 0.3), inset 0 0 10px rgba(22, 163, 74, 0.2)'
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
                            stroke: isHovered ? '#16A34A' : 'white',
                            filter: isHovered
                                ? 'drop-shadow(0 0 6px rgba(22, 163, 74, 0.8))'
                                : 'none'
                        }}
                    >
                        {/* Terminal/Command Line Icon */}
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                </div>
            </button>
        </div>
    )
}
