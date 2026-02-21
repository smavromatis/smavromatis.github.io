import React from 'react'

export default function CreditsModal({ isOpen, isMobile, onClose }) {
    return (
        <div
            className={`fixed ${isMobile ? 'bottom-24' : 'bottom-4 sm:bottom-6'} ${isMobile ? 'right-2' : 'right-4 sm:right-6'} z-50`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative">
                {/* Credits Info Panel */}
                <div
                    className={`absolute bottom-14 right-0 ${isMobile ? 'w-[calc(100vw-32px)] max-w-[400px]' : 'w-[480px]'} rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden`}
                    style={{
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                        transition: isOpen
                            ? 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                            : 'opacity 300ms cubic-bezier(0.4, 0, 1, 1), transform 300ms cubic-bezier(0.4, 0, 1, 1)',
                        pointerEvents: isOpen ? 'auto' : 'none',
                        visibility: isOpen ? 'visible' : 'hidden',
                        transitionDelay: isOpen ? '0ms' : '0ms'
                    }}
                >
                    <div className="w-full p-6 flex flex-col">
                        <h3 className="text-white font-semibold text-base mb-3.5">Credits</h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-white/70 text-sm">
                                    <span className="text-white/90 font-semibold">Created by:</span> Stylianos Mavromatis
                                </p>
                            </div>

                            <div>
                                <p className="text-white/90 font-semibold text-sm mb-2.5">Built with</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">React</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Vite</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Tailwind CSS</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Lenis</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">OGL</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Motion</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">@use-gesture</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Radix UI</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">React Markdown</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Rehype</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Remark</span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">Sharp</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-white/20 pb-6">
                                <p className="text-white/50 text-xs italic leading-snug">
                                    Thank you to all open source contributors!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credits Toggle Button */}
                <button
                    onClick={onClose}
                    className="transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Show credits"
                    style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div className="flex items-center justify-center p-2.5 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:bg-white/15 transition-colors">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                opacity: 0.7
                            }}
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    )
}
