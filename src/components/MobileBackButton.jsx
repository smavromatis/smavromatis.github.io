import React from 'react'

/**
 * MobileBackButton
 * Fixed top-left back button shown when on a non-home tab on mobile.
 * Tapping it navigates back to the home screen.
 */
export default function MobileBackButton({ onBack }) {
    return (
        <button
            onClick={onBack}
            className="fixed z-50 flex items-center gap-2 active:scale-95 transition-transform duration-150"
            style={{
                top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
                left: '16px',
                height: '40px',
                padding: '0 14px 0 10px',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                touchAction: 'manipulation',
            }}
            aria-label="Back to home"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m15 18-6-6 6-6"/>
            </svg>
            <span
                className="text-white/80 font-medium leading-none"
                style={{ fontSize: '14px' }}
            >
                Home
            </span>
        </button>
    )
}
