import React from 'react';
import DecryptedText from '@/components/DecryptedText';

export default function HomeHero({ homeContent, isMobile, showContent, textContainerRef, homeTextVerticalOffset }) {
    if (!showContent) return null;

    return (
        <div
            ref={textContainerRef}
            className={`max-w-6xl mx-auto ${isMobile ? 'px-3 py-8' : 'px-4 sm:px-6'} ${isMobile ? 'space-y-4' : 'space-y-6 sm:space-y-8'}`}
            style={{
                transform: `translateY(${homeTextVerticalOffset}vh)`,
                transition: 'transform 600ms cubic-bezier(0.45, 0.05, 0.55, 0.95)',
                paddingBottom: isMobile ? '140px' : '0'
            }}
        >
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'} font-bold tracking-tight text-center ${isMobile ? 'px-2' : 'px-4'}`}>
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

                <p className={`${isMobile ? 'text-sm' : 'text-base sm:text-lg md:text-xl'} text-white/90 max-w-4xl mx-auto leading-relaxed text-center ${isMobile ? 'px-2' : 'px-4'}`}>
                    {homeContent.subtitle}
                </p>

                {/* Blog Features */}
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} ${isMobile ? 'gap-3' : 'gap-4 sm:gap-6'} max-w-3xl mx-auto ${isMobile ? 'pt-3' : 'pt-4 sm:pt-8'} ${isMobile ? 'px-2' : 'px-4'}`}>
                    {homeContent.features.map((feature, idx) => (
                        <div key={idx} className={`text-center ${isMobile ? 'space-y-1' : 'space-y-2'} opacity-80 hover:opacity-100 transition-opacity`}>
                            <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>{feature.title}</h3>
                            <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-white/60`}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
