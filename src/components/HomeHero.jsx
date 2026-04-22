import React from 'react';
import DecryptedText from '@/components/DecryptedText';

import MobileHUDMenu from './MobileHUDMenu';

const SECTIONS = [
    {
        id: 'photography',
        label: 'Photography',
        description: 'A gallery of captured moments',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
            </svg>
        ),
    },
    {
        id: 'archive',
        label: 'Archive',
        description: 'Articles, writeups & projects',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
        ),
    },
    {
        id: 'about',
        label: 'About',
        description: 'Who I am and what I do',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        ),
    },
];

export default function HomeHero({ 
    homeContent, 
    isMobile, 
    showContent, 
    textContainerRef, 
    homeTextVerticalOffset, 
    onTabChange,
    colorPalettes,
    selectedPaletteIndex,
    selectPalette,
    onEasterEggClick,
    ducklingSpawnRef,
    isCreditsOpen,
    setIsCreditsOpen
}) {
    if (!showContent) return null;

    if (isMobile) {
        return (
            <div
                ref={textContainerRef}
                className="w-full px-5 flex flex-col overflow-hidden touch-none"
                style={{
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    height: '100dvh',
                    gap: '0',
                }}
            >
                {/* ── Optical Center Spacer Top ── */}
                <div style={{ flexGrow: 0.8 }} />

                {/* Hero text */}
                <div className="space-y-3 mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-center">
                        <DecryptedText
                            text={homeContent.heroText}
                            speed={30}
                            sequential={true}
                            revealDirection="start"
                            animateOn="view"
                            className="text-white"
                            encryptedClassName="text-white/40"
                            useOriginalCharsOnly={false}
                            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                        />
                    </h1>
                    <p className="text-sm text-white/70 leading-relaxed text-center px-1">
                        {homeContent.subtitle}
                    </p>
                </div>

                {/* Section cards */}
                <div className="flex flex-col gap-3">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => onTabChange?.(section.id)}
                            className="w-full flex items-center gap-4 rounded-2xl text-left active:scale-[0.98] transition-transform duration-150"
                            style={{
                                padding: '16px 20px',
                                background: 'rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                                minHeight: '72px',
                                touchAction: 'manipulation',
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="flex items-center justify-center rounded-xl flex-shrink-0 text-white/70"
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                {section.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-base leading-tight">
                                    {section.label}
                                </p>
                                <p className="text-white/50 text-xs mt-0.5 leading-tight">
                                    {section.description}
                                </p>
                            </div>

                            {/* Chevron */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Static HUD Menu at the bottom of the home screen */}
                <div className="mt-8 flex justify-center w-full relative z-50">
                    <MobileHUDMenu 
                        colorPalettes={colorPalettes}
                        selectedPaletteIndex={selectedPaletteIndex}
                        selectPalette={selectPalette}
                        onEasterEggClick={onEasterEggClick}
                        ducklingSpawnRef={ducklingSpawnRef}
                        isCreditsOpen={isCreditsOpen}
                        setIsCreditsOpen={setIsCreditsOpen}
                    />
                </div>

                {/* ── Optical Center Spacer Bottom ── */}
                <div style={{ flexGrow: 1.4 }} />
            </div>
        );
    }

    // ── Desktop layout (unchanged) ──────────────────────────────────
    return (
        <div
            ref={textContainerRef}
            className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8"
            style={{
                transform: `translateY(${homeTextVerticalOffset}vh)`,
                transition: 'transform 600ms cubic-bezier(0.45, 0.05, 0.55, 0.95)',
            }}
        >
            <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center px-4">
                    <DecryptedText
                        text={homeContent.heroText}
                        speed={30}
                        sequential={true}
                        revealDirection="start"
                        animateOn="view"
                        className="text-white"
                        encryptedClassName="text-white/40"
                        useOriginalCharsOnly={false}
                        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                    />
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed text-center px-4">
                    {homeContent.subtitle}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto pt-4 sm:pt-8 px-4">
                    {homeContent.features.map((feature, idx) => (
                        <div key={idx} className="text-center space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                            <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                            <p className="text-xs text-white/60">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
