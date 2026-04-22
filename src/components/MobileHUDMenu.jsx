import React, { useState } from 'react'

/**
 * MobileHUDMenu
 * Subtle ⋯ button that expands downwards on the home screen.
 */
export default function MobileHUDMenu({
    colorPalettes,
    selectedPaletteIndex,
    selectPalette,
    onEasterEggClick,
    ducklingSpawnRef,
    setIsCreditsOpen,
}) {
    const [isOpen, setIsOpen] = useState(false)

    const currentPalette = colorPalettes[selectedPaletteIndex]

    const close = () => {
        setIsOpen(false)
    }

    const handlePalette = () => {
        // Cycle to the next palette directly
        const nextIndex = (selectedPaletteIndex + 1) % colorPalettes.length;
        selectPalette(nextIndex);
    }

    const handleCredits = () => {
        setIsCreditsOpen(v => !v)
    }

    const handleEgg = () => {
        if (ducklingSpawnRef?.current?.spawnDuckling) {
            ducklingSpawnRef.current.spawnDuckling()
        }
        close()
    }

    const handleTerminal = () => {
        onEasterEggClick?.()
        close()
    }

    const hasOpenedEggs = ducklingSpawnRef?.current?.hasOpenedEggs ?? true

    return (
        <>
            {/* Backdrop to close on outside tap */}
            <div
                className="fixed inset-0 z-40"
                onClick={close}
                style={{
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 300ms ease',
                }}
            />

            <div className="relative z-50 flex items-center justify-center" style={{ width: '44px', height: '44px' }}>
                
                {/* ── Popup Items (Half-Moon Arc) ── */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    {/* Palette (Cycles Colors) - Left Arc */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ 
                            transform: isOpen ? 'translate(-68px, 20px) scale(1)' : 'translate(0, 0) scale(0)',
                            opacity: isOpen ? 1 : 0,
                            pointerEvents: isOpen ? 'auto' : 'none',
                            transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? '0ms' : '240ms'}`
                        }}
                    >
                        <MenuBtn onClick={handlePalette}>
                            <div className="flex gap-0.5 items-center justify-center">
                                {currentPalette.colors.map((c, i) => (
                                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}99`, flexShrink: 0 }} />
                                ))}
                            </div>
                        </MenuBtn>
                    </div>

                    {/* Terminal - Bottom Left Arc */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ 
                            transform: isOpen ? 'translate(-26px, 52px) scale(1)' : 'translate(0, 0) scale(0)',
                            opacity: isOpen ? 1 : 0,
                            pointerEvents: isOpen ? 'auto' : 'none',
                            transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? '80ms' : '160ms'}`
                        }}
                    >
                        <MenuBtn onClick={handleTerminal}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 17 10 11 4 5" />
                                <line x1="12" y1="19" x2="20" y2="19" />
                            </svg>
                        </MenuBtn>
                    </div>

                    {/* Egg - Bottom Right Arc */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ 
                            transform: isOpen ? 'translate(26px, 52px) scale(1)' : 'translate(0, 0) scale(0)',
                            opacity: isOpen ? 1 : 0,
                            pointerEvents: isOpen ? 'auto' : 'none',
                            transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? '160ms' : '80ms'}`
                        }}
                    >
                        <MenuBtn onClick={handleEgg}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ stroke: hasOpenedEggs ? 'rgba(255,255,255,0.9)' : '#FFD700' }}>
                                <path d="M12 22c5 0 8-4 8-9s-4-11-8-11-8 6-8 11 3 9 8 9z" />
                            </svg>
                        </MenuBtn>
                    </div>

                    {/* Credits - Right Arc */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ 
                            transform: isOpen ? 'translate(68px, 20px) scale(1)' : 'translate(0, 0) scale(0)',
                            opacity: isOpen ? 1 : 0,
                            pointerEvents: isOpen ? 'auto' : 'none',
                            transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? '240ms' : '0ms'}`
                        }}
                    >
                        <MenuBtn onClick={handleCredits}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </MenuBtn>
                    </div>
                </div>

                {/* ── ⋯ trigger ── */}
                <button
                    onClick={() => {
                        if (isOpen) { close() } else { setIsOpen(true) }
                    }}
                    className="relative z-10 flex items-center justify-center rounded-full active:scale-90"
                    style={{
                        width: '44px',
                        height: '44px',
                        background: 'transparent',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)',
                        touchAction: 'manipulation',
                    }}
                    aria-label={isOpen ? 'Close menu' : 'Options'}
                >
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        stroke={isOpen ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transition: 'stroke 300ms ease' }}
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </>
    )
}

function MenuBtn({ onClick, children }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center rounded-full active:scale-90 transition-transform"
            style={{
                width: '48px',
                height: '48px',
                flexShrink: 0,
                background: 'transparent',
                touchAction: 'manipulation',
            }}
        >
            {children}
        </button>
    )
}
