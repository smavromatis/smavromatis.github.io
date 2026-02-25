import React from 'react';
import GlassSurface from '@/components/GlassSurface';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tabs } from '@/lib/constants';

export default function NavigationMenu({
    activeTab,
    isMobile,
    isNavExpanded,
    setIsNavExpanded,
    navPosition,
    isNavPositionReady,
    hasLoadedOnce,
    enableNavTransition,
    handleTabChange,
}) {
    return (
        <nav
            className="fixed z-50"
            style={{
                top: 0,
                left: 0,
                transform: isMobile
                    ? activeTab === 'home'
                        ? 'translate(calc(50vw - 50%), calc(100vh - 68px))'
                        : activeTab === 'photography'
                            ? 'translate(calc(50vw - 50%), calc(100vh - 68px))'
                            : activeTab === 'about'
                                ? 'translate(calc(50vw - 50%), 12px)'
                                : 'translate(calc(50vw - 50%), 12px)' // Centered for archive tab
                    : activeTab === 'home'
                        ? `translate(calc(50vw - 50%), calc(50vh + ${navPosition}vh))`
                        : activeTab === 'photography'
                            ? 'translate(calc(50vw - 50%), calc(100vh - 48px - 24px))'
                            : activeTab === 'about'
                                ? 'translate(calc(50vw - 50%), 24px)'
                                : 'translate(24px, 24px)',
                visibility: (activeTab === 'home' && !isNavPositionReady && !hasLoadedOnce && !isMobile) ? 'hidden' : 'visible',
                transition: enableNavTransition ? 'transform 600ms cubic-bezier(0.45, 0.05, 0.55, 0.95)' : 'none',
                willChange: 'transform',
                overflow: 'visible',
                zIndex: isMobile && activeTab === 'archive' ? 45 : 50
            }}
            onMouseEnter={() => !isMobile && setIsNavExpanded(true)}
            onMouseLeave={() => !isMobile && setIsNavExpanded(false)}
            onTouchStart={() => !isMobile && setIsNavExpanded(true)}
        >
            {/* Compact Dot Navigation for Archive Tab */}
            {activeTab === 'archive' && !isNavExpanded ? (
                <GlassSurface
                    width={160}
                    height={48}
                    borderRadius={50}
                    backgroundOpacity={0.15}
                    saturation={1.8}
                    borderWidth={0.1}
                    brightness={60}
                    opacity={0.9}
                    blur={20}
                    displace={1.5}
                    distortionScale={-200}
                    redOffset={0}
                    greenOffset={15}
                    blueOffset={30}
                    style={{
                        transition: 'all 500ms cubic-bezier(0.34, 1.2, 0.64, 1)',
                        willChange: 'width',
                        overflow: 'visible'
                    }}
                >
                    <div
                        className="w-full h-full rounded-full backdrop-blur-sm flex items-center justify-center gap-3 px-4"
                        style={{
                            background: 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)'
                        }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className="group relative"
                                title={tab.label}
                            >
                                <div
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-125'
                                        : 'bg-white/40 hover:bg-white/70 hover:scale-110'
                                        }`}
                                    style={{
                                        transition: 'all 300ms cubic-bezier(0.34, 1.2, 0.64, 1)'
                                    }}
                                />
                                {/* Tooltip on hover */}
                                <div
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
                                >
                                    <span
                                        className="text-white text-xs font-medium px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm"
                                        style={{
                                            textShadow: '0 0 6px rgba(255, 255, 255, 0.4)'
                                        }}
                                    >
                                        {tab.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </GlassSurface>
            ) : (
                /* Regular Navigation */
                <>
                    <GlassSurface
                        width={
                            isMobile
                                ? 'min(calc(100vw - 24px), 380px)'
                                : (activeTab === 'home' && !isNavExpanded) ? 48 : 400
                        }
                        height={isMobile ? 56 : 48}
                        borderRadius={50}
                        backgroundOpacity={(activeTab === 'archive' && !isMobile) ? 0.15 : 0.05}
                        saturation={1.8}
                        borderWidth={0.1}
                        brightness={(activeTab === 'archive' && !isMobile) ? 60 : 80}
                        opacity={(activeTab === 'archive' && !isMobile) ? 0.9 : 0.7}
                        blur={(activeTab === 'archive' && !isMobile) ? 20 : 16}
                        displace={1.5}
                        distortionScale={-200}
                        redOffset={0}
                        greenOffset={15}
                        blueOffset={30}
                        style={{
                            transition: 'all 500ms cubic-bezier(0.34, 1.2, 0.64, 1)',
                            willChange: 'width',
                            overflow: 'visible',
                            maxWidth: isMobile ? 'calc(100vw - 32px)' : 'none'
                        }}
                    >
                        <TabsList
                            className={`w-full h-full rounded-full text-muted-foreground overflow-visible flex items-center ${(activeTab === 'archive' && !isMobile) ? 'backdrop-blur-sm' : 'bg-transparent'
                                }`}
                            style={{
                                padding: (activeTab === 'home' && !isNavExpanded && !isMobile) ? '0' : isMobile ? '6px' : '4px',
                                justifyContent: (activeTab === 'home' && !isNavExpanded && !isMobile) ? 'center' : isMobile ? 'space-evenly' : 'space-between',
                                background: (activeTab === 'archive' && !isMobile)
                                    ? 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)'
                                    : 'transparent'
                            }}
                        >
                            {tabs.map((tab, index) => {
                                const isCollapsed = activeTab === 'home' && !isNavExpanded && !isMobile
                                const shouldShow = !isCollapsed || isMobile
                                const displayText = tab.label
                                const archiveTextShadow = (activeTab === 'archive' && !isMobile)
                                    ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)'
                                    : 'none'

                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={`rounded-full outline-none ring-0 border-0 focus-visible:outline-none focus-visible:ring-0 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] active:text-white active:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] data-[state=active]:shadow-none ${shouldShow ? `${isMobile ? 'flex-none' : 'flex-1'} opacity-100 ${isMobile ? 'px-2 py-2.5 text-xs' : 'px-4 py-1.5 text-sm'}` : 'flex-[0_0_0px] opacity-0 px-0'
                                            }`}
                                        style={{
                                            transition: shouldShow
                                                ? `all 500ms cubic-bezier(0.34, 1.2, 0.64, 1) ${index * 50}ms, opacity 350ms ease-out ${index * 50}ms`
                                                : 'all 500ms cubic-bezier(0.34, 1.2, 0.64, 1) 0ms, opacity 150ms ease-in 0ms',
                                            willChange: shouldShow ? 'flex, opacity' : 'auto',
                                            background: 'transparent',
                                            boxShadow: 'none',
                                            textShadow: archiveTextShadow,
                                            fontWeight: (activeTab === 'archive' && !isMobile) ? '500' : '400',
                                            minHeight: isMobile ? '48px' : 'auto',
                                            touchAction: 'manipulation'
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '14px',
                                                lineHeight: '1',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: shouldShow ? 'opacity 300ms ease-out 100ms' : 'opacity 100ms ease-in 0ms'
                                            }}
                                        >
                                            {displayText}
                                        </span>
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </GlassSurface>

                    {/* Centered "›" symbol overlay for collapsed home nav */}
                    {activeTab === 'home' && !isNavExpanded && !isMobile && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{
                                opacity: isNavExpanded ? 0 : 1,
                                transition: 'opacity 200ms ease-out'
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="translate-x-[1px]"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))'
                                }}
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    )}
                </>
            )}
        </nav>
    );
}
