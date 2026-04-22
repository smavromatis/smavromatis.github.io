import React from 'react'

const TECH_STACK = [
    'React', 'Vite', 'Tailwind CSS', 'Lenis', 'OGL', 'Motion', 
    '@use-gesture', 'Radix UI', 'React Router', 'React Markdown', 
    'Rehype', 'Remark', 'Gray Matter', 'Sharp', 'ESLint', 'PostCSS'
];

function CreditsContent() {
    return (
        <div className="space-y-3">
            <div>
                <p className="text-white/70 text-sm">
                    <span className="text-white/90 font-semibold">Created by:</span> Stylianos Mavromatis
                </p>
            </div>

            <div>
                <p className="text-white/90 font-semibold text-sm mb-2.5">Built with</p>
                <div className="flex flex-wrap gap-2">
                    {TECH_STACK.map((tech) => (
                        <span key={tech} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pt-3 border-t border-white/20 pb-6">
                <p className="text-white/50 text-xs italic leading-snug">
                    Thank you to all open source contributors!
                </p>
            </div>
        </div>
    );
}

export default function CreditsModal({ isOpen, isMobile, onClose }) {
    // ── Mobile layout (Centered Modal Overlay) ──
    if (isMobile) {
        return (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                style={{
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 300ms ease',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: isOpen ? 'blur(4px)' : 'none',
                    WebkitBackdropFilter: isOpen ? 'blur(4px)' : 'none',
                }}
                onClick={onClose}
            >
                <div
                    className="w-full max-w-[340px] rounded-3xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
                    style={{
                        transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                        transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms',
                        opacity: isOpen ? 1 : 0,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-full p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-semibold text-lg">Credits</h3>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                                </svg>
                            </button>
                        </div>
                        <CreditsContent />
                    </div>
                </div>
            </div>
        )
    }

    // ── Desktop layout (Bottom-Right Floating Panel) ──
    return (
        <div
            className="fixed z-50"
            style={{
                bottom: '1.5rem',
                right: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative">
                {/* Credits Info Panel */}
                <div
                    className={`absolute bottom-14 right-0 w-[480px] rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden`}
                    style={{
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen
                            ? 'translateY(0) scale(1)'
                            : 'translateY(20px) scale(0.9)',
                        transition: isOpen
                            ? 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                            : 'opacity 300ms cubic-bezier(0.4, 0, 1, 1), transform 300ms cubic-bezier(0.4, 0, 1, 1)',
                        pointerEvents: isOpen ? 'auto' : 'none',
                        visibility: isOpen ? 'visible' : 'hidden',
                    }}
                >
                    <div className="w-full p-6 flex flex-col">
                        <h3 className="text-white font-semibold text-base mb-3.5">Credits</h3>
                        <CreditsContent />
                    </div>
                </div>

                {/* Credits Toggle Button (Desktop Only) */}
                <button
                    onClick={onClose}
                    className="transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Show credits"
                    style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                            style={{ opacity: 0.7 }}
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
