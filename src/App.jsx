import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import GlassSurface from '@/components/GlassSurface'
import Aurora from '@/components/Aurora'
import Archive from '@/components/Archive'
import About from '@/components/About'
import HomeHero from '@/components/HomeHero'
import ThoughtOfTheDay from '@/components/ThoughtOfTheDay'
import EasterEggButton from '@/components/EasterEggButton'
import DucklingButton from '@/components/DucklingButton'
import ColorPaletteSelector from '@/components/ColorPaletteSelector'
import MobileHUDMenu from '@/components/MobileHUDMenu'

// Helper function to handle lazy loading with retry/reload mechanism for chunk errors
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Chunk loading failed, forcing reload...', error);
      // Only reload once to avoid infinite loops if it's a real network issue
      const hasReloaded = sessionStorage.getItem('chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload', 'true');
        window.location.reload();
        return { default: () => null }; // Return empty component while reloading
      }
      throw error;
    }
  });
};

const DomeGallery = lazyWithRetry(() => import('@/components/DomeGallery'))
const InfiniteGridGallery = lazyWithRetry(() => import('@/components/InfiniteGridGallery'))
import { Tabs, TabsContent } from '@/components/ui/tabs'
import ClickSpark from '@/components/ClickSpark'
import DecryptedText from '@/components/DecryptedText'
import LetterGlitch from '@/components/LetterGlitch'
import DragHint from '@/components/DragHint'

const HackerDashboard = lazyWithRetry(() => import('@/components/HackerDashboard'))
const CreditsModal = lazyWithRetry(() => import('@/components/CreditsModal'))

import { usePhotos } from '@/hooks/usePhotos'
import 'lenis/dist/lenis.css'

import { tabs, colorPalettes } from '@/lib/constants'
import { checkIsLowEndDevice } from '@/lib/device'
import TabAwareAurora from '@/components/TabAwareAurora'
import NavigationMenu from '@/components/NavigationMenu'
import MobileBackButton from '@/components/MobileBackButton'

const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      <p className="text-white/20 text-xs uppercase tracking-widest font-medium">Loading</p>
    </div>
  </div>
);

function App() {
  // ========== HOME PAGE LAYOUT CONTROLS ==========
  // Adjust these values to position elements on the home page
  // Values use viewport height units (vh): 1vh = 1% of screen height
  const [homeTextVerticalOffset, setHomeTextVerticalOffset] = useState(-10);
  const textToNavSpacing = 8;          // Gap between text and nav bar (in vh units) - reduced for better mobile spacing
  // Nav bar automatically positions below text to prevent overlap on any screen size
  // ================================================

  const [isLowEndDevice] = useState(checkIsLowEndDevice);

  // ========== THOUGHT OF THE DAY ==========
  // To update the quote, edit: /public/thoughts.txt
  const [allThoughts, setAllThoughts] = useState([]);

  const [homeContent, setHomeContent] = useState({
    heroText: "Welcome to my corner of the web",
    subtitle: "Driven by curiosity and problem-solving. Breaking systems down to understand how they work, learning something new, and sharing that knowledge to help others grow.",
    features: [
      {
        title: "Hacking & Reverse Engineering",
        description: "Deconstructing systems to reveal their inner workings"
      },
      {
        title: "3D Printing & Robotics",
        description: "Building tangible solutions from digital blueprints"
      },
      {
        title: "Astrophotography & F1",
        description: "Capturing the cosmos and celebrating engineering excellence"
      }
    ]
  });
  const [archiveConfig, setArchiveConfig] = useState({
    isDrafting: true, // Start as true so it matches your current JSON
    draftingTitle: "Building the Archive",
    draftingMessage: "Articles and stories are currently being drafted and will be published soon. Stay tuned!"
  });

  useEffect(() => {
    fetch('/content.json')
      .then(response => response.json())
      .then(data => {
        if (data.home) {
          setHomeContent(data.home);
        }
        if (data.archiveConfig) {
          setArchiveConfig(data.archiveConfig);
        }
        if (data.quotes && data.quotes.length > 0) {
          setAllThoughts(data.quotes);
        }
        // Preload profile picture so it's cached before the user visits About
        if (data.about?.imagePath) {
          const img = new Image();
          img.src = data.about.imagePath;
        }
      })
      .catch(error => console.error('Error loading content:', error));
  }, []);

  // ========================================

  // Load photos from public/photos directory
  const { photos } = usePhotos();

  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = useCallback(() => {
    const p = location.pathname.split('/')[1] || 'home';
    return tabs.find(t => t.id === p) ? p : 'home';
  }, [location.pathname]);

  // Load saved palette preference or default to 0
  const getInitialPalette = () => {
    const saved = localStorage.getItem('selectedPaletteIndex')
    return saved !== null ? parseInt(saved, 10) : 0
  }

  const [activeTab, setActiveTab] = useState(getTabFromPath())
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return true;
    return window.matchMedia('(max-width: 767px)').matches;
  })
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(getInitialPalette)
  const [isPalettePickerOpen, setIsPalettePickerOpen] = useState(false)
  const [hoveredPaletteName, setHoveredPaletteName] = useState(null)
  const [hoveredPalettePosition, setHoveredPalettePosition] = useState({ x: 0, y: 0 })
  const [navPosition, setNavPosition] = useState(0)
  const [isNavPositionReady, setIsNavPositionReady] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [enableNavTransition, setEnableNavTransition] = useState(false)
  const [showDragHint, setShowDragHint] = useState(true)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const [isArchiveWideView, setIsArchiveWideView] = useState(false)
  const [isEasterEggHovered, setIsEasterEggHovered] = useState(false)
  const [isHackerDashboardOpen, setIsHackerDashboardOpen] = useState(false)
  const [isHackerDashboardClosing, setIsHackerDashboardClosing] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const textContainerRef = useRef(null)
  const ducklingSpawnRef = useRef(null) // bridge: DucklingButton exposes spawnDuckling via this ref

  const selectPalette = (index) => {
    setSelectedPaletteIndex(index)
    setIsPalettePickerOpen(false)
    localStorage.setItem('selectedPaletteIndex', index.toString())
  }

  const handleCloseDashboard = () => {
    setIsHackerDashboardClosing(true)
    setShowCloseButton(false)
    setTimeout(() => {
      setIsHackerDashboardOpen(false)
      setIsHackerDashboardClosing(false)
    }, 700) // Match animation duration
  }

  // Show close button immediately with dashboard
  useEffect(() => {
    if (isHackerDashboardOpen && !isHackerDashboardClosing) {
      setShowCloseButton(true)
    } else {
      setShowCloseButton(false)
    }
  }, [isHackerDashboardOpen, isHackerDashboardClosing])

  // Initialize Lenis smooth scroll - Apple-like feel
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(rafId)
    }
  }, [])




  // Detect mobile device
  useEffect(() => {
    // Clear the chunk reload flag once the app has successfully mounted
    sessionStorage.removeItem('chunk_reload');
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Adjust text position for very short screens
  useEffect(() => {
    const updateTextPosition = () => {
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Mobile-specific positioning - more aggressive upward shift
      if (viewportWidth < 768) {
        // Leave space for navigation at bottom (80px) and thought of day (60px)
        setHomeTextVerticalOffset(-12)
      } else if (viewportHeight < 600) {
        setHomeTextVerticalOffset(-15)
      } else if (viewportHeight < 700) {
        setHomeTextVerticalOffset(-12)
      } else {
        setHomeTextVerticalOffset(-10)
      }
    }

    updateTextPosition()
    window.addEventListener('resize', updateTextPosition)

    return () => {
      window.removeEventListener('resize', updateTextPosition)
    }
  }, [])

  // Calculate nav position based on actual text container height
  useEffect(() => {
    const timers = []
    let resizeTimeout
    let animationFrameId

    const updateNavPosition = () => {
      if (textContainerRef.current && activeTab === 'home' && showContent) {
        const rect = textContainerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Calculate desired position: text bottom + spacing
        const spacingPx = (textToNavSpacing / 100) * viewportHeight
        const textBottom = rect.bottom
        const viewportCenter = viewportHeight / 2

        // Calculate offset from center in pixels
        const desiredOffsetPx = (textBottom - viewportCenter) + spacingPx

        // Ensure navbar never overlaps text by checking if it would go above text bottom
        // Nav bar height is 48px, add small buffer of 16px
        const navBarHeight = 48 + 16
        const minOffsetPx = (textBottom - viewportCenter) + navBarHeight

        // Use the larger of desired spacing or minimum safe spacing
        const finalOffsetPx = Math.max(desiredOffsetPx, minOffsetPx)

        // Convert to vh
        const offsetVh = (finalOffsetPx / viewportHeight) * 100

        // Ensure nav doesn't go off the bottom of the screen
        // Calculate how much space we need: navbar height + bottom margin
        const navTotalHeight = (48 + 24) // 48px navbar + 24px bottom margin
        const maxOffsetVh = ((viewportHeight - navTotalHeight - viewportCenter) / viewportHeight) * 100

        // Use the minimum to keep navbar on screen, but prioritize preventing text overlap
        const safeOffsetVh = Math.min(offsetVh, maxOffsetVh)

        setNavPosition(safeOffsetVh)
      }
    }

    // Debounced resize handler for better performance
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateNavPosition, 150)
    }

    // Only perform position updates for home tab
    if (activeTab === 'home') {
      window.addEventListener('resize', handleResize)

      // Immediate calculation and multiple updates to ensure DOM is fully rendered
      // Using requestAnimationFrame for the first update to ensure layout is complete
      animationFrameId = requestAnimationFrame(() => {
        // Do initial position calculation
        updateNavPosition()

        // Make navbar visible immediately after first position calculation
        // Use another RAF to ensure the position state has updated
        requestAnimationFrame(() => {
          if (activeTab === 'home' && !hasLoadedOnce) {
            setIsNavPositionReady(true)
            setHasLoadedOnce(true)

            // Enable transitions after navbar is visible and positioned
            // This prevents the initial animation from center to offset
            requestAnimationFrame(() => {
              setEnableNavTransition(true)
            })
          }
        })

        // Continue updating position as text decrypts and layout settles
        // DecryptedText animation takes ~1920ms (32 chars * 60ms)
        timers.push(setTimeout(updateNavPosition, 100))
        timers.push(setTimeout(updateNavPosition, 500))
        timers.push(setTimeout(updateNavPosition, 1000))
        timers.push(setTimeout(updateNavPosition, 2000))
      })

      return () => {
        window.removeEventListener('resize', handleResize)
        clearTimeout(resizeTimeout)
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        timers.forEach(timer => clearTimeout(timer))
      }
    }
  }, [activeTab, showContent, textToNavSpacing, homeTextVerticalOffset, hasLoadedOnce])

  useEffect(() => {
    const currentPathTab = getTabFromPath();
    if (currentPathTab !== activeTab) {
      setShowContent(false);
      setActiveTab(currentPathTab);
      // For non-home tabs, make nav immediately ready since position doesn't need calculation
      if (currentPathTab !== 'home') {
        setIsNavPositionReady(true);
        setEnableNavTransition(true);
      }
      // Reset drag hint when switching to photography
      if (currentPathTab === 'photography') {
        setShowDragHint(true);
      }
      // Delay content appearance until nav animation completes (600ms on desktop, near-instant on mobile)
      const transitionDelay = window.innerWidth < 768 ? 50 : 600;
      setTimeout(() => {
        setShowContent(true);
        // For home tab, position will be calculated by the effect and set ready after 1000ms
      }, transitionDelay);
    }
  }, [location.pathname, activeTab, getTabFromPath]);

  const handleTabChange = (newTab) => {
    const currentPathTab = getTabFromPath();
    if (newTab !== currentPathTab) {
      if (newTab === 'home') {
        navigate('/');
      } else {
        navigate(`/${newTab}`);
      }
    }
  }

  // Hide drag hint on user interaction
  const handleDomeInteraction = useCallback(() => {
    if (showDragHint) {
      setShowDragHint(false)
    }
  }, [showDragHint])

  return (
    <ClickSpark
      sparkColor="#ffffff"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={8}
      duration={500}
      easing="ease-out"
    >
      <div
        className="relative min-h-screen overflow-hidden bg-background text-foreground"
        onClick={() => {
          if (isCreditsOpen) {
            setIsCreditsOpen(false)
          }
        }}
      >
        {/* Background - Dynamic parameters based on active tab */}
        <div
          className="fixed inset-0 z-0"
          style={{ width: '100%', height: '100vh' }}
        >
          <TabAwareAurora
            activeTab={activeTab}
            colorStops={colorPalettes[selectedPaletteIndex].colors}
            isLowEndDevice={isLowEndDevice}
          />
        </div>

        {/* Full-screen blur overlay for Archive, Photography and About tabs */}
        {(activeTab === 'archive' || activeTab === 'photography' || activeTab === 'about') && (
          <div
            className={`fixed inset-0 z-5 bg-black/40 pointer-events-none ${isLowEndDevice ? '' : 'backdrop-blur-md bg-black/20'}`}
            style={{
              opacity: showContent ? 1 : 0,
              transition: showContent ? 'opacity 400ms ease-in 100ms' : 'opacity 400ms ease-in',
              height: '100vh',
            }}
          />
        )}

        <div id="main-app-content" className="relative z-10 flex flex-col" style={{ minHeight: '100dvh' }}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
            {/* Navigation */}
            <NavigationMenu
              activeTab={activeTab}
              isMobile={isMobile}
              isNavExpanded={isNavExpanded}
              setIsNavExpanded={setIsNavExpanded}
              navPosition={navPosition}
              isNavPositionReady={isNavPositionReady}
              hasLoadedOnce={hasLoadedOnce}
              enableNavTransition={enableNavTransition}
              handleTabChange={handleTabChange}
            />

            <main className="flex min-h-screen flex-col">
              {/* Archive Tab */}
              <TabsContent
                value="archive"
                className="mt-0 flex-1 flex flex-col pt-8 pb-8"
                style={{
                  opacity: showContent ? 1 : 0,
                  transition: showContent ? 'opacity 400ms ease-in 100ms' : 'opacity 150ms ease-out',
                  pointerEvents: showContent ? 'auto' : 'none',
                  position: 'relative',
                  zIndex: isMobile ? 10 : 'auto'
                }}
              >
                {showContent && (
                  <Archive 
                    isWideView={isArchiveWideView} 
                    onWideViewChange={setIsArchiveWideView}
                    archiveConfig={archiveConfig}
                  />
                )}
              </TabsContent>

              {/* Photography Tab - Full Screen Gallery */}
              {activeTab === 'photography' && (
                <TabsContent
                  value="photography"
                  className="mt-0 flex-1 flex flex-col absolute inset-0"
                  style={{
                    opacity: showContent ? 1 : 0,
                    transition: showContent ? 'opacity 400ms ease-in 100ms' : 'opacity 150ms ease-out',
                    pointerEvents: showContent ? 'auto' : 'none',
                    zIndex: 20
                  }}
                >
                  {showContent && (
                    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 20 }}>
                      <Suspense fallback={<LoadingState />}>
                        {isMobile ? (
                          <InfiniteGridGallery
                            images={photos}
                            onInteraction={handleDomeInteraction}
                          />
                        ) : (
                          <DomeGallery
                            images={photos}
                            grayscale={false}
                            onInteraction={handleDomeInteraction}
                            imageBorderRadius="30px"
                            openedImageBorderRadius="30px"
                            padFactor={0.05}
                            enlargeTransitionMs={400}
                          />
                        )}
                      </Suspense>
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Home Tab - Centered Content */}
              <TabsContent
                value="home"
                className="mt-0 flex-1 flex items-center justify-center"
                style={{
                  opacity: showContent ? 1 : 0,
                  transition: showContent ? 'opacity 400ms ease-in 100ms' : 'opacity 150ms ease-out',
                  pointerEvents: showContent ? 'auto' : 'none'
                }}
                onClick={() => {
                  if (isPalettePickerOpen) {
                    setIsPalettePickerOpen(false)
                  }
                  if (isCreditsOpen) {
                    setIsCreditsOpen(false)
                  }
                }}
              >
                <HomeHero
                  homeContent={homeContent}
                  isMobile={isMobile}
                  showContent={showContent}
                  textContainerRef={textContainerRef}
                  homeTextVerticalOffset={homeTextVerticalOffset}
                  onTabChange={handleTabChange}
                  // HUD Props for Mobile
                  colorPalettes={colorPalettes}
                  selectedPaletteIndex={selectedPaletteIndex}
                  selectPalette={selectPalette}
                  onEasterEggClick={() => setIsHackerDashboardOpen(true)}
                  ducklingSpawnRef={ducklingSpawnRef}
                  isCreditsOpen={isCreditsOpen}
                  setIsCreditsOpen={setIsCreditsOpen}
                />
              </TabsContent>

              {/* Thought of the Day - desktop only; too cluttered on mobile */}
              {activeTab === 'home' && showContent && !isMobile && (
                <ThoughtOfTheDay
                  allThoughts={allThoughts}
                  isMobile={isMobile}
                  showContent={showContent}
                />
              )}

              {/* About Tab */}
              <TabsContent
                value="about"
                className="mt-0 flex-1 flex flex-col"
                style={{
                  opacity: showContent ? 1 : 0,
                  transition: showContent ? 'opacity 400ms ease-in 100ms' : 'opacity 150ms ease-out',
                  pointerEvents: showContent ? 'auto' : 'none'
                }}
              >
                {showContent && (
                  <About />
                )}
              </TabsContent>
            </main>
          </Tabs>

          {/* Mobile back button — shown when inside a non-home tab */}
          {isMobile && activeTab !== 'home' && (
            <MobileBackButton onBack={() => handleTabChange('home')} />
          )}

          {/* Drag Hint */}
          {activeTab === 'photography' && showContent && showDragHint && !isMobile && !isLowEndDevice && (
            <DragHint />
          )}

          {!isMobile && (
            <>
              <ColorPaletteSelector
                colorPalettes={colorPalettes}
                selectedPaletteIndex={selectedPaletteIndex}
                isMobile={false}
                activeTab={activeTab}
                isPalettePickerOpen={isPalettePickerOpen}
                setIsPalettePickerOpen={setIsPalettePickerOpen}
                selectPalette={selectPalette}
                hoveredPaletteName={hoveredPaletteName}
                setHoveredPaletteName={setHoveredPaletteName}
                hoveredPalettePosition={hoveredPalettePosition}
                setHoveredPalettePosition={setHoveredPalettePosition}
              />
              <EasterEggButton
                isMobile={false}
                isHovered={isEasterEggHovered}
                setIsHovered={setIsEasterEggHovered}
                onClick={() => setIsHackerDashboardOpen(true)}
              />
            </>
          )}

          <Suspense fallback={null}>
            <CreditsModal
              isOpen={isCreditsOpen}
              isMobile={isMobile}
              onClose={() => setIsCreditsOpen(!isCreditsOpen)}
            />
          </Suspense>

          {/* Duckling spawner — always rendered (manages its own fixed ducks) */}
          <DucklingButton isMobile={isMobile} activeTab={activeTab} spawnRef={ducklingSpawnRef} />

          {/* Hacker Dashboard Overlay */}
          <Suspense fallback={null}>
            <HackerDashboard
              isOpen={isHackerDashboardOpen}
              isClosing={isHackerDashboardClosing}
              onClose={handleCloseDashboard}
              showCloseButton={showCloseButton}
            />
          </Suspense>

          {/* Animations */}
          <style>{`
            @keyframes appleSlideIn {
              0% {
                opacity: 0;
                transform: scale(1.05) translateY(-20px);
                filter: blur(10px) brightness(1.1);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
                filter: blur(0px) brightness(1);
              }
            }
            
            @keyframes appleSlideOut {
              0% {
                opacity: 1;
                transform: scale(1) translateY(0);
                filter: blur(0px) brightness(1);
              }
              100% {
                opacity: 0;
                transform: scale(1.05) translateY(-20px);
                filter: blur(10px) brightness(1.1);
              }
            }
          `}</style>
        </div>
      </div>
    </ClickSpark>
  )
}

export default App
