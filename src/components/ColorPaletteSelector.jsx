import React from 'react'

export default function ColorPaletteSelector({
    colorPalettes,
    selectedPaletteIndex,
    isMobile,
    activeTab,
    isPalettePickerOpen,
    setIsPalettePickerOpen,
    selectPalette,
    hoveredPaletteName,
    setHoveredPaletteName,
    hoveredPalettePosition,
    setHoveredPalettePosition
}) {
    return (
        <div
            className={`fixed ${isMobile ? 'bottom-24' : 'bottom-4 sm:bottom-6'} ${isMobile ? 'left-2' : 'left-4 sm:left-6'} z-50`}
            style={{
                opacity: activeTab === 'home' ? 1 : 0,
                pointerEvents: activeTab === 'home' ? 'auto' : 'none',
                transition: 'opacity 400ms ease-in-out'
            }}
        >
            <div className="relative" style={{ width: isMobile ? '280px' : '400px', height: isMobile ? '280px' : '400px' }}>
                {colorPalettes.map((palette, index) => {
                    const horizontalPosition = 20;
                    const verticalPosition = -16;
                    const buttonCenterX = horizontalPosition;
                    const buttonCenterY = verticalPosition;
                    const spacing = isMobile ? 45 : 60;
                    const positions = [
                        { x: buttonCenterX + spacing * 1, y: buttonCenterY },
                        { x: buttonCenterX + spacing * 2, y: buttonCenterY },
                        { x: buttonCenterX + spacing * 3, y: buttonCenterY },
                        { x: buttonCenterX + spacing * 4, y: buttonCenterY },
                        { x: buttonCenterX + spacing * 5, y: buttonCenterY },
                        { x: buttonCenterX + spacing * 6, y: buttonCenterY },
                        { x: buttonCenterX + spacing * 7, y: buttonCenterY },
                    ]

                    const pos = positions[index]
                    const x = isPalettePickerOpen ? pos.x : buttonCenterX
                    const y = isPalettePickerOpen ? pos.y : buttonCenterY

                    return (
                        <button
                            key={index}
                            onClick={() => selectPalette(index)}
                            onMouseEnter={() => {
                                setHoveredPaletteName(palette.name)
                                setHoveredPalettePosition({ x, y })
                            }}
                            onMouseLeave={() => {
                                setHoveredPaletteName(null)
                            }}
                            className="absolute"
                            style={{
                                left: '0',
                                bottom: '0',
                                transform: isPalettePickerOpen
                                    ? `translate(${x}px, ${y}px) scale(1)`
                                    : 'translate(0, 0) scale(0)',
                                opacity: isPalettePickerOpen ? 1 : 0,
                                transition: `all ${350 + index * 35}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                                pointerEvents: isPalettePickerOpen ? 'auto' : 'none',
                                zIndex: selectedPaletteIndex === index ? 10 : 1
                            }}
                        >
                            <div className="relative transition-all duration-300 hover:scale-110">
                                <div className="flex gap-0.5 items-center">
                                    <div className="w-3 h-3 rounded-full" style={{ background: palette.colors[0], boxShadow: `0 0 8px ${palette.colors[0]}60, 0 1px 4px rgba(0,0,0,0.3)` }} />
                                    <div className="w-3 h-3 rounded-full" style={{ background: palette.colors[1], boxShadow: `0 0 8px ${palette.colors[1]}60, 0 1px 4px rgba(0,0,0,0.3)` }} />
                                    <div className="w-3 h-3 rounded-full" style={{ background: palette.colors[2], boxShadow: `0 0 8px ${palette.colors[2]}60, 0 1px 4px rgba(0,0,0,0.3)` }} />
                                </div>
                            </div>

                            {selectedPaletteIndex === index && (
                                <div
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{
                                        background: palette.colors[1],
                                        boxShadow: `0 0 10px ${palette.colors[1]}80, 0 2px 6px rgba(0,0,0,0.3)`
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2 2L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    )
                })}

                {isPalettePickerOpen && (
                    <div
                        className="absolute transition-all duration-300"
                        style={{ left: '62px', bottom: '12px', zIndex: 15, opacity: isPalettePickerOpen ? 1 : 0, pointerEvents: 'none' }}
                    >
                        <span className="text-white text-sm font-light" style={{ textShadow: '0 0 6px rgba(255, 255, 255, 0.5)' }}>›</span>
                    </div>
                )}

                {hoveredPaletteName && (() => {
                    const horizontalOffset = 20;
                    const verticalOffset = -25;
                    const centerAdjust = -50;

                    return (
                        <div
                            className="absolute transition-all duration-300"
                            style={{
                                left: '0',
                                bottom: '0',
                                transform: `translate(${hoveredPalettePosition.x + horizontalOffset}px, ${hoveredPalettePosition.y + verticalOffset}px)`,
                                zIndex: 25,
                                pointerEvents: 'none'
                            }}
                        >
                            <span
                                className="text-white text-xs font-medium whitespace-nowrap block"
                                style={{
                                    textShadow: '0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.3)',
                                    transform: `translateX(${centerAdjust}%)`
                                }}
                            >
                                {hoveredPaletteName}
                            </span>
                        </div>
                    )
                })()}

                <button
                    onClick={() => setIsPalettePickerOpen(!isPalettePickerOpen)}
                    className="absolute transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{ left: '0', bottom: '0', zIndex: 20, minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div className="flex gap-1.5 p-2">
                        {colorPalettes[selectedPaletteIndex].colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                                style={{
                                    background: color,
                                    boxShadow: isPalettePickerOpen
                                        ? `0 0 16px ${color}80, 0 4px 12px rgba(0,0,0,0.3)`
                                        : `0 0 10px ${color}60, 0 2px 8px rgba(0,0,0,0.3)`,
                                    transform: isPalettePickerOpen ? 'scale(1.2)' : 'scale(1)'
                                }}
                            />
                        ))}
                    </div>
                </button>
            </div>
        </div>
    )
}
