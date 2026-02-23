import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import GlassSurface from '@/components/GlassSurface'
import Aurora from '@/components/Aurora'
import Archive from '@/components/Archive'
import About from '@/components/About'
import DomeGallery from '@/components/DomeGallery'
import InfiniteGridGallery from '@/components/InfiniteGridGallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ClickSpark from '@/components/ClickSpark'
import DecryptedText from '@/components/DecryptedText'
import LetterGlitch from '@/components/LetterGlitch'
import HackerDashboard from '@/components/HackerDashboard'
import CreditsModal from '@/components/CreditsModal'
import EasterEggButton from '@/components/EasterEggButton'
import DucklingButton from '@/components/DucklingButton'
import DragHint from '@/components/DragHint'
import ColorPaletteSelector from '@/components/ColorPaletteSelector'
import { usePhotos } from '@/hooks/usePhotos'
import 'lenis/dist/lenis.css'

const tabs = [
  { id: 'home', label: 'Home', description: 'Latest thoughts and ideas.' },
  {
    id: 'photography',
    label: 'Photography',
    description: 'Stories captured through the lens.',
  },
  {
    id: 'archive',
    label: 'Archive',
    description: 'A collection of experiments and builds.',
  },
  {
    id: 'about',
    label: 'About',
    description: 'Get to know me better.',
  },
]

const colorPalettes = [
  { name: 'Arctic Dream', colors: ['#1e3a8a', '#10b981', '#6366f1'] },        // Deep blue → emerald green → indigo
  { name: 'Polar Night', colors: ['#6366f1', '#ec4899', '#a855f7'] },        // Indigo → pink → purple
  { name: 'Solar Storm', colors: ['#10b981', '#f472b6', '#14b8a6'] },        // Emerald → hot pink → teal
  { name: 'Cosmic Dance', colors: ['#8b5cf6', '#06b6d4', '#d946ef'] },       // Purple → cyan → fuchsia
  { name: 'Midnight Sun', colors: ['#7c3aed', '#fbbf24', '#f97316'] },       // Violet → amber → orange
  { name: 'Ice Fire', colors: ['#0ea5e9', '#ec4899', '#06b6d4'] },           // Sky blue → pink → cyan
  { name: 'Northern Whisper', colors: ['#a78bfa', '#6ee7b7', '#93c5fd'] },   // Lavender → mint → light blue
]

// Hardware Acceleration / Low End Device Check
const checkIsLowEndDevice = () => {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem('isLowEndDevice');
  if (stored !== null) return stored === 'true';

  let isLowEnd = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      isLowEnd = true;
    } else {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        const softwareRenderers = ['swiftshader', 'llvmpipe', 'software rasterizer'];
        isLowEnd = softwareRenderers.some(str => renderer.includes(str));
      }
    }
  } catch (e) {
    isLowEnd = true;
  }

  localStorage.setItem('isLowEndDevice', isLowEnd);
  return isLowEnd;
};

function TabAwareAurora({ activeTab, colorStops, isLowEndDevice }) {
  const [auroraAmplitude, setAuroraAmplitude] = useState(1.0)
  const [auroraBlend, setAuroraBlend] = useState(0.5)
  const [auroraVerticalOffset, setAuroraVerticalOffset] = useState(0.0)
  const animationRef = useRef(null)
  const currentValuesRef = useRef({ amplitude: 1.0, blend: 0.5, verticalOffset: 0.0 })

  useEffect(() => {
    if (isLowEndDevice) return; // Skip complex animation loop if low end

    const targetAmplitude = (activeTab === 'archive' || activeTab === 'about') ? 0.3 : 1.0
    const targetBlend = (activeTab === 'archive' || activeTab === 'about') ? 0.04 : 0.5
    const targetVerticalOffset = (activeTab === 'archive' || activeTab === 'about') ? -0.6 : 0.0

    if (animationRef.current) cancelAnimationFrame(animationRef.current)

    const startAmplitude = currentValuesRef.current.amplitude
    const startBlend = currentValuesRef.current.blend
    const startVerticalOffset = currentValuesRef.current.verticalOffset
    const duration = 800 // ms
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const newAmplitude = startAmplitude + (targetAmplitude - startAmplitude) * eased
      const newBlend = startBlend + (targetBlend - startBlend) * eased
      const newVerticalOffset = startVerticalOffset + (targetVerticalOffset - startVerticalOffset) * eased

      currentValuesRef.current = { amplitude: newAmplitude, blend: newBlend, verticalOffset: newVerticalOffset }
      setAuroraAmplitude(newAmplitude)
      setAuroraBlend(newBlend)
      setAuroraVerticalOffset(newVerticalOffset)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [activeTab, isLowEndDevice])

  // Fallback for devices without hardware acceleration
  if (isLowEndDevice) {
    const opacity = (activeTab === 'archive' || activeTab === 'about') ? 0.4 : 0.8;
    return (
      <div
        className="w-full h-full transition-all duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colorStops[0]} 0%, ${colorStops[1]} 50%, ${colorStops[2]} 100%)`,
          opacity: opacity,
          filter: 'blur(60px)'
        }}
      />
    );
  }

  return (
    <Aurora
      amplitude={auroraAmplitude}
      blend={auroraBlend}
      verticalOffset={auroraVerticalOffset}
      colorStops={colorStops}
    />
  )
}

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
  const [thoughtOfTheDay, setThoughtOfTheDay] = useState({
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  });
  const [allThoughts, setAllThoughts] = useState([]);
  const [, setThoughtIndex] = useState(0);

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

  useEffect(() => {
    fetch('/content.json')
      .then(response => response.json())
      .then(data => {
        if (data.home) {
          setHomeContent(data.home);
        }
        if (data.quotes && data.quotes.length > 0) {
          setAllThoughts(data.quotes);
          setThoughtOfTheDay(data.quotes[0]);
          setThoughtIndex(0);
        }
      })
      .catch(error => console.error('Error loading content:', error));
  }, []);

  const thoughtTimerRef = useRef(null)

  const handleMouseEnterThought = () => {
    if (thoughtTimerRef.current) {
      clearTimeout(thoughtTimerRef.current)
      thoughtTimerRef.current = null
    }
  }

  const handleMouseLeaveThought = () => {
    if (thoughtTimerRef.current) {
      clearTimeout(thoughtTimerRef.current)
    }
    thoughtTimerRef.current = setTimeout(() => {
      setThoughtIndex(prevIdx => {
        if (allThoughts.length > 1) {
          const nextIdx = (prevIdx + 1) % allThoughts.length;
          setThoughtOfTheDay(allThoughts[nextIdx]);
          return nextIdx;
        }
        return prevIdx;
      });
      thoughtTimerRef.current = null;
    }, 400);
  }
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
  const [isMobile, setIsMobile] = useState(false)
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



  useEffect(() => {
    document.documentElement.classList.add('dark')

    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On mobile, always expand nav
      if (window.innerWidth < 768) {
        setIsNavExpanded(true)
      }
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
      // Delay content appearance until nav animation completes (600ms)
      setTimeout(() => {
        setShowContent(true);
        // For home tab, position will be calculated by the effect and set ready after 1000ms
      }, 600);
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
        <div className="fixed inset-0 z-0">
          <TabAwareAurora
            activeTab={activeTab}
            colorStops={colorPalettes[selectedPaletteIndex].colors}
            isLowEndDevice={isLowEndDevice}
          />
        </div>

        {/* Full-screen blur overlay for Archive, Photography and About tabs */}
        {(activeTab === 'archive' || activeTab === 'photography' || activeTab === 'about') && (
          <div
            className="fixed inset-0 z-5 backdrop-blur-md bg-black/20 pointer-events-none"
            style={{
              opacity: showContent ? 1 : 0,
              transition: 'opacity 400ms ease-in',
              transitionDelay: showContent ? '100ms' : '0ms'
            }}
          />
        )}

        <div id="main-app-content" className="relative z-10 flex min-h-screen flex-col">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
            {/* Navigation */}
            <nav
              className="fixed z-50"
              style={{
                top: 0,
                left: 0,
                transform:
                  isMobile
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
                                ? 'all 500ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity 350ms ease-out'
                                : 'all 500ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity 150ms ease-in',
                              transitionDelay: shouldShow ? `${index * 50}ms` : '0ms',
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
                                transition: shouldShow ? 'opacity 300ms ease-out' : 'opacity 100ms ease-in',
                                transitionDelay: shouldShow ? '100ms' : '0ms'
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
                {showContent && <Archive isWideView={isArchiveWideView} onWideViewChange={setIsArchiveWideView} />}
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
                <div
                  ref={textContainerRef}
                  className={`max-w-6xl mx-auto ${isMobile ? 'px-3 py-8' : 'px-4 sm:px-6'} ${isMobile ? 'space-y-4' : 'space-y-6 sm:space-y-8'}`}
                  style={{
                    transform: `translateY(${homeTextVerticalOffset}vh)`,
                    transition: 'transform 600ms cubic-bezier(0.45, 0.05, 0.55, 0.95)',
                    paddingBottom: isMobile ? '140px' : '0'
                  }}
                >
                  {showContent && (
                    <>
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
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Thought of the Day - Bottom of Home Screen */}
              {activeTab === 'home' && showContent && (
                <div
                  className={`fixed ${isMobile ? 'bottom-20' : 'bottom-4 sm:bottom-8'} left-1/2 -translate-x-1/2 z-10 group pointer-events-auto`}
                  style={{
                    opacity: showContent ? 1 : 0,
                    transition: 'opacity 400ms ease-in-out',
                    perspective: '1000px',
                    maxWidth: isMobile ? 'calc(100vw - 32px)' : 'auto'
                  }}
                  onMouseEnter={handleMouseEnterThought}
                  onMouseLeave={handleMouseLeaveThought}
                >
                  {/* Invisible expanded hitbox for much easier hovering */}
                  <div className="absolute -inset-x-16 -inset-y-12 z-0 cursor-default"></div>

                  <div
                    className="flip-container relative z-10 px-4"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: 'rotateX(0deg)'
                    }}
                  >
                    {/* Front: Label (flips away) */}
                    <div
                      className="flex items-center gap-2 cursor-default flip-front"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <svg
                        className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="text-white/30 text-xs font-light uppercase tracking-widest group-hover:text-white/50 transition-colors duration-300">
                        quick thought
                      </span>
                    </div>

                    {/* Back: Quote (flips in) */}
                    <div
                      className="absolute top-0 cursor-default flip-back flex flex-col items-center justify-center gap-1"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateX(-50%) rotateX(180deg)',
                        left: '50%',
                        width: 'max-content'
                      }}
                    >
                      <p className="text-white/30 text-xs font-light uppercase tracking-widest whitespace-nowrap">
                        "{thoughtOfTheDay.quote}"
                      </p>
                      {thoughtOfTheDay.author && (
                        <p className="text-white/20 text-[10px] font-light uppercase tracking-wider">
                          — {thoughtOfTheDay.author}
                        </p>
                      )}
                    </div>
                  </div>

                  <style>{`
                  @media (hover: hover) {
                    .group:hover .flip-container {
                      transform: rotateX(180deg) !important;
                    }
                  }
                  @media (hover: none) {
                    .group:active .flip-container {
                      transform: rotateX(180deg) !important;
                    }
                  }
                `}</style>
                </div>
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
                {showContent && <About />}
              </TabsContent>
            </main>
          </Tabs>

          {/* Drag Hint */}
          {activeTab === 'photography' && showContent && showDragHint && !isMobile && (
            <DragHint />
          )}

          {/* Color Palette Selector */}
          <ColorPaletteSelector
            colorPalettes={colorPalettes}
            selectedPaletteIndex={selectedPaletteIndex}
            isMobile={isMobile}
            activeTab={activeTab}
            isPalettePickerOpen={isPalettePickerOpen}
            setIsPalettePickerOpen={setIsPalettePickerOpen}
            selectPalette={selectPalette}
            hoveredPaletteName={hoveredPaletteName}
            setHoveredPaletteName={setHoveredPaletteName}
            hoveredPalettePosition={hoveredPalettePosition}
            setHoveredPalettePosition={setHoveredPalettePosition}
          />

          {/* Easter Egg Button */}
          <EasterEggButton
            isMobile={isMobile}
            isHovered={isEasterEggHovered}
            setIsHovered={setIsEasterEggHovered}
            onClick={() => setIsHackerDashboardOpen(true)}
          />

          {/* Duckling Spawner Button */}
          <DucklingButton isMobile={isMobile} />

          {/* Credits Button */}
          <CreditsModal
            isOpen={isCreditsOpen}
            isMobile={isMobile}
            onClose={() => setIsCreditsOpen(!isCreditsOpen)}
          />

          {/* Hacker Dashboard Overlay */}
          <HackerDashboard
            isOpen={isHackerDashboardOpen}
            isClosing={isHackerDashboardClosing}
            onClose={handleCloseDashboard}
            showCloseButton={showCloseButton}
          />

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
