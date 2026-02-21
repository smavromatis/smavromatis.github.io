import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { archive } from 'virtual:archive'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/tokyo-night-dark.css'
import GlassSurface from '@/components/GlassSurface'
import Lenis from 'lenis'
import { cn } from '@/lib/utils'

const getMarkdownClasses = (isMobile) => cn(
  'prose prose-invert max-w-none',
  'prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight',
  isMobile ? 'prose-sm' : 'prose-lg',

  // H1
  isMobile ? 'prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6' : 'prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8',

  // H2
  isMobile ? 'prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:pb-2' : 'prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-3',
  'prose-h2:border-b prose-h2:border-white/10',

  // H3 & H4
  isMobile ? 'prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4' : 'prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8',
  isMobile ? 'prose-h4:text-base prose-h4:mb-2 prose-h4:mt-4' : 'prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-6',

  // Paragraphs & Links
  isMobile ? 'prose-p:text-white/85 prose-p:leading-[1.7] prose-p:mb-4 prose-p:text-sm' : 'prose-p:text-white/85 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.05rem]',
  'prose-a:text-blue-400 prose-a:no-underline prose-a:font-medium prose-a:border-b prose-a:border-blue-400/30 hover:prose-a:border-blue-400 hover:prose-a:text-blue-300 prose-a:transition-all',

  // Inline styles
  'prose-strong:text-white prose-strong:font-bold',
  'prose-em:text-white/90 prose-em:italic prose-em:not-italic',

  // Inline Code
  isMobile
    ? 'prose-code:text-emerald-400 prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:font-mono prose-code:before:content-[\'\'] prose-code:after:content-[\'\'] prose-code:font-semibold'
    : 'prose-code:text-emerald-400 prose-code:bg-white/[0.08] prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:before:content-[\'\'] prose-code:after:content-[\'\'] prose-code:font-semibold',

  // Code Blocks
  isMobile
    ? 'prose-pre:!bg-[#1a1b26] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:shadow-2xl prose-pre:my-4'
    : 'prose-pre:!bg-[#1a1b26] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-2xl prose-pre:my-8',
  'prose-pre:code:!bg-transparent prose-pre:code:!p-0 prose-pre:code:!text-white/95 prose-pre:code:font-normal prose-pre:code:!text-[#a9b1d6]',
  isMobile ? 'prose-pre:code:!text-sm prose-pre:code:leading-relaxed' : 'prose-pre:code:!text-base prose-pre:code:leading-relaxed',

  // Blockquotes
  isMobile
    ? 'prose-blockquote:border-l-4 prose-blockquote:border-blue-500/60 prose-blockquote:bg-blue-500/5 prose-blockquote:text-white/75 prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:pr-3 prose-blockquote:py-3 prose-blockquote:rounded-r-lg prose-blockquote:my-4 prose-blockquote:not-italic'
    : 'prose-blockquote:border-l-4 prose-blockquote:border-blue-500/60 prose-blockquote:bg-blue-500/5 prose-blockquote:text-white/75 prose-blockquote:italic prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:my-6 prose-blockquote:not-italic',

  // Lists
  isMobile ? 'prose-ul:text-white/85 prose-ul:my-4 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1' : 'prose-ul:text-white/85 prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2',
  isMobile ? 'prose-ol:text-white/85 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1' : 'prose-ol:text-white/85 prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2',
  isMobile ? 'prose-li:text-white/85 prose-li:leading-relaxed prose-li:text-sm' : 'prose-li:text-white/85 prose-li:leading-relaxed prose-li:text-[1.05rem]',
  'prose-li>prose-p:my-2',

  // Tables
  'prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-white/10 prose-table:rounded-lg prose-table:overflow-hidden',
  isMobile ? 'prose-table:my-4' : 'prose-table:my-8',
  'prose-thead:bg-white/5 prose-thead:border-b-2 prose-thead:border-white/20',
  isMobile
    ? 'prose-th:text-white prose-th:font-bold prose-th:p-2 prose-th:text-left prose-th:border-r prose-th:border-white/10 prose-th:last:border-r-0 prose-th:text-xs'
    : 'prose-th:text-white prose-th:font-bold prose-th:p-4 prose-th:text-left prose-th:border-r prose-th:border-white/10 prose-th:last:border-r-0',
  'prose-tbody:divide-y prose-tbody:divide-white/10',
  isMobile
    ? 'prose-td:text-white/85 prose-td:p-2 prose-td:border-r prose-td:border-white/10 prose-td:last:border-r-0 prose-td:text-xs'
    : 'prose-td:text-white/85 prose-td:p-4 prose-td:border-r prose-td:border-white/10 prose-td:last:border-r-0',
  'prose-tr:transition-colors hover:prose-tr:bg-white/5',

  // Images & HR
  isMobile ? 'prose-img:rounded-lg prose-img:border prose-img:border-white/10 prose-img:shadow-xl prose-img:my-4' : 'prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-8',
  isMobile ? 'prose-hr:border-white/20 prose-hr:my-6' : 'prose-hr:border-white/20 prose-hr:my-12'
)

const Archive = ({ isWideView, onWideViewChange }) => {
  const { categories, items } = archive
  const scrollContainerRef = useRef(null)
  const lenisRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  const getItemIdFromPath = useCallback(() => {
    const parts = location.pathname.split('/')
    if (parts[1] === 'archive' && parts[2]) {
      return parts[2]
    }
    return null
  }, [location.pathname])

  // Track which categories are expanded (all start collapsed on desktop, first category expanded on mobile)
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initialId = getItemIdFromPath()
    if (initialId && items) {
      const item = items.find(i => i.id === initialId)
      if (item && item.category) {
        return new Set([item.category])
      }
    }
    return new Set()
  })

  const [expandedSubcategories, setExpandedSubcategories] = useState(() => {
    const initialId = getItemIdFromPath()
    if (initialId && items) {
      const item = items.find(i => i.id === initialId)
      if (item && item.subcategory) {
        return new Set([item.subcategory])
      }
    }
    return new Set()
  })

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId)
      } else {
        newSet.add(subcategoryId)
      }
      return newSet
    })
  }

  const [selectedItemId, setSelectedItemId] = useState(getItemIdFromPath())
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [menuQuery, setMenuQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState(null)

  useEffect(() => {
    const pId = getItemIdFromPath()
    if (pId !== selectedItemId) {
      setSelectedItemId(pId)
    }
  }, [location.pathname, selectedItemId, getItemIdFromPath])

  // Detect mobile device and screen width
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

  // Close sidebar on mobile when item is selected
  useEffect(() => {
    if (isMobile && selectedItemId) {
      setIsSidebarOpen(false)
    }
  }, [selectedItemId, isMobile])

  // Auto-expand first category when sidebar opens on mobile (only once)
  useEffect(() => {
    if (isMobile && isSidebarOpen && categories && categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set([categories[0].id]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isSidebarOpen]) // Only run when mobile state or sidebar open state changes

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Initialize Lenis smooth scroll for the Archive content area
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContainerRef.current,
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

    lenisRef.current = lenis

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(rafId)
      lenisRef.current = null
    }
  }, [])

  // Resize Lenis when view mode changes
  useEffect(() => {
    if (lenisRef.current) {
      // Small delay to allow CSS transition to complete
      setTimeout(() => {
        lenisRef.current.resize()
      }, 100)
    }
  }, [isWideView])

  // Reset scroll position and resize when item changes
  useEffect(() => {
    // Reset scroll using Lenis's scrollTo method for smooth scroll compatibility
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })

      // Resize Lenis to recalculate scroll boundaries for new content
      setTimeout(() => {
        lenisRef.current.resize()
      }, 150)
    }
  }, [selectedItemId])

  // Safety check for archive data
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-white/60 text-lg">No archive categories found</p>
          <p className="text-white/40 text-sm mt-2">Add folders to public/archive/</p>
        </div>
      </div>
    )
  }

  const selectedItem = items.find(item => item.id === selectedItemId)

  return (
    <div className="w-full flex gap-6 mx-auto px-4 sm:px-6 transition-all duration-700 ease-in-out" style={{ maxWidth: isWideView ? '1920px' : '1400px' }}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            transition: 'opacity 300ms ease-in-out',
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none'
          }}
        />
      )}

      {/* Left Sidebar - Desktop only */}
      {!isMobile && (
        <div
          className={`fixed left-6 top-24 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out`}
          style={{
            height: 'calc(100vh - 120px)',
            width: '320px',
            maxWidth: '320px',
            overflow: 'hidden',
            transform: 'translateX(0)'
          }}
        >
          {/* Header with View Toggle */}
          <div className="mb-4 px-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white`}>Archive</h2>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsSidebarOpen(false)
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/70 transition-all duration-200"
                    aria-label="Close sidebar"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {!isMobile && (
                  <button
                    onClick={() => onWideViewChange(!isWideView)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-200"
                    title={isWideView ? 'Switch to narrow view' : 'Switch to wide view'}
                  >
                    {isWideView ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            <p className="text-white/40 text-xs">{items.length} total items</p>
          </div>

          <div className={`flex-1 ${isMobile ? 'overflow-y-auto' : 'overflow-hidden'} space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`} style={{ maxHeight: isMobile ? 'calc(100vh - 120px)' : 'none' }}>
            {/* Categories */}
            {categories && categories.length > 0 ? categories.map((category) => {
              const isExpanded = expandedCategories.has(category.id)
              const categoryItemsList = items.filter(item => item.category === category.id)

              return (
                <div key={category.id} className="space-y-2">
                  {/* Category Header */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCategory(category.id)
                    }}
                    className={`w-full h-12 text-left px-4 rounded-full transition-all duration-300 touch-manipulation ${isExpanded
                      ? 'bg-white/8 backdrop-blur-md text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      : 'bg-white/3 backdrop-blur-md text-white/70 hover:bg-white/5 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] active:bg-white/5 active:text-white'
                      }`}
                    style={{
                      cursor: 'pointer',
                      minHeight: '48px'
                    }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">{category.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isExpanded ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                        }`}>
                        {category.count}
                      </span>
                    </div>
                  </button>

                  {/* Category Items - Show when category is expanded */}
                  {isExpanded && categoryItemsList.length > 0 && (
                    <div className="space-y-1 pl-2">
                      {(() => {
                        const renderItem = (item) => {
                          const isItemSelected = selectedItemId === item.id
                          return (
                            <button
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/archive/${item.id}`)
                                if (isMobile) {
                                  setIsSidebarOpen(false)
                                }
                              }}
                              className={`group w-full text-left px-3 py-1.5 rounded-full transition-all duration-300 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 touch-manipulation ${isItemSelected
                                ? 'bg-transparent text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                : 'bg-transparent text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] active:text-white'
                                }`}
                              style={{ minHeight: '32px' }}
                            >
                              <div className="flex items-center gap-3">
                                {/* Thumbnail */}
                                {item.image && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      loading="lazy"
                                      onContextMenu={(e) => e.preventDefault()}
                                      className="w-full h-full object-cover protect-photo"
                                    />
                                  </div>
                                )}

                                {/* Title */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xs font-medium line-clamp-1">
                                    {item.title}
                                  </h3>
                                </div>
                              </div>
                            </button>
                          )
                        }

                        // Build a recursive tree from subcategory paths
                        const root = { items: [], children: {} }
                        categoryItemsList.forEach(item => {
                          if (!item.subcategory) {
                            root.items.push(item)
                          } else {
                            const parts = item.subcategory.split('/')
                            let current = root
                            let pathSoFar = ''
                            parts.forEach((part) => {
                              pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part
                              if (!current.children[part]) {
                                current.children[part] = { path: pathSoFar, name: part, items: [], children: {} }
                              }
                              current = current.children[part]
                            })
                            current.items.push(item)
                          }
                        })

                        // Recursive renderer for the tree
                        const renderTree = (node, level = 0) => {
                          return (
                            <>
                              {node.items.map(renderItem)}
                              {Object.values(node.children).map(childNode => {
                                const isSubExpanded = expandedSubcategories.has(childNode.path)
                                return (
                                  <div key={childNode.path} className="mt-2 mb-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleSubcategory(childNode.path)
                                      }}
                                      className="w-full text-left px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white/50 hover:text-white/80 flex items-center gap-2 transition-colors duration-200 outline-none rounded-md hover:bg-white/5"
                                    >
                                      <svg
                                        className={`w-3 h-3 transition-transform duration-300 ${isSubExpanded ? 'rotate-90 text-white/70' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                      {childNode.name}
                                    </button>
                                    {isSubExpanded && (
                                      <div className={`space-y-1 mt-1 border-l border-white/10 ${level === 0 ? 'ml-[22px] pl-1' : 'ml-[11px] pl-2'}`}>
                                        {renderTree(childNode, level + 1)}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </>
                          )
                        }

                        return renderTree(root)
                      })()}
                    </div>
                  )}
                </div>
              )
            }) : (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">No categories available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Panel with GlassSurface */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[70]"
          style={{ top: '92px', width: 'min(720px, calc(100vw - 24px))', height: 'calc(100vh - 112px)' }}
          data-lenis-prevent
        >
          <GlassSurface
            width="100%"
            height="100%"
            borderRadius={16}
            backgroundOpacity={0.15}
            saturation={1.8}
            borderWidth={0.15}
            brightness={60}
            opacity={0.95}
            blur={24}
            displace={1.5}
            distortionScale={-200}
            redOffset={0}
            greenOffset={15}
            blueOffset={30}
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="w-full h-full flex flex-col" style={{ background: 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)' }}>
              {/* Compact Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/10 backdrop-blur-xl sticky top-0 z-10">
                <div className="text-sm font-semibold text-white/90">Browse</div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:bg-white/25"
                  aria-label="Close"
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Filters + Search (single sticky toolbar) */}
              <div className="px-3 pt-2 pb-2 space-y-2 border-b border-white/10 sticky top-[48px] z-10 bg-white/5 backdrop-blur-xl">
                <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <button
                    onClick={() => setActiveCategoryId(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${activeCategoryId === null ? 'bg-white/20 text-white border-white/20' : 'bg-white/5 text-white/70 border-white/10 hover:text-white'}`}
                  >All</button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${activeCategoryId === cat.id ? 'bg-white/20 text-white border-white/20' : 'bg-white/5 text-white/70 border-white/10 hover:text-white'}`}
                    >{cat.name}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    value={menuQuery}
                    onChange={(e) => setMenuQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                    inputMode="search"
                  />
                </div>
              </div>

              {/* Flat list of items */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" data-lenis-prevent>
                {items
                  .filter(i => (activeCategoryId ? i.category === activeCategoryId : true))
                  .filter(i => i.title.toLowerCase().includes(menuQuery.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { navigate(`/archive/${item.id}`); setIsSidebarOpen(false) }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white transition-colors border border-white/10"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="flex items-center gap-3 text-left">
                        {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover protect-photo" onContextMenu={(e) => e.preventDefault()} loading="lazy" />}
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{item.title}</div>
                          {item.description && <div className="text-xs text-white/60 line-clamp-1">{item.description}</div>}
                          {item.subcategory && <div className="mt-1 text-[0.65rem] text-white/40 uppercase font-bold tracking-wider inline-flex items-center gap-1"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>{item.subcategory.split('/').pop()}</div>}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                {items.filter(i => (activeCategoryId ? i.category === activeCategoryId : true)).filter(i => i.title.toLowerCase().includes(menuQuery.toLowerCase())).length === 0 && (
                  <div className="text-center text-white/50 text-sm py-8">No results</div>
                )}
              </div>
            </div>
          </GlassSurface>
        </div>
      )}

      {/* Mobile Browse Button with GlassSurface */}
      {isMobile && (
        <div
          className={`fixed z-[65] left-1/2 -translate-x-1/2 transition-all duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}
          style={{
            top: '72px',
            position: 'fixed',
            zIndex: 65,
            pointerEvents: isSidebarOpen ? 'none' : 'auto',
            maxWidth: 'calc(100vw - 24px)',
            width: 'auto'
          }}
        >
          <GlassSurface
            width="auto"
            height={44}
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
              transition: 'all 300ms ease-out',
              willChange: 'transform'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsSidebarOpen(true)
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-white transition-all duration-200 flex items-center gap-2 sm:gap-3 w-full h-full"
              aria-label="Browse categories"
              aria-expanded={isSidebarOpen}
              style={{
                minHeight: '44px',
                touchAction: 'manipulation',
                background: 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)'
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h4v4H4V6zm6 0h4v4h-4V6zm6 0h4v4h-4V6zM4 12h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Browse</span>
              <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </GlassSurface>
        </div>
      )}

      {/* Right Panel - Item Details (Independent Scroll) */}
      <div className={`flex-1 min-w-0 ${isMobile ? 'ml-0 pl-0' : 'ml-80 pl-6'}`} style={{ position: 'relative', zIndex: isMobile ? 1 : 'auto' }}>
        <div
          ref={scrollContainerRef}
          className={`overflow-y-auto ${isMobile ? 'pr-4 pl-4' : 'pr-6'} scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}
          style={{ height: isMobile ? 'calc(100vh - 72px)' : 'calc(100vh - 120px)' }}
          data-lenis-prevent
        >
          {selectedItem ? (
            <div className={`space-y-6 pb-12 ${isMobile ? 'pt-24' : ''}`}>
              {/* Hero Image */}
              {selectedItem.image && (
                <div className={`w-full ${isMobile ? 'h-48' : 'h-64 md:h-80 lg:h-96'} rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20`}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    loading="lazy"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover protect-photo"
                  />
                </div>
              )}

              {/* Content */}
              <div className={`space-y-6 transition-all duration-700 ease-in-out ${isWideView && !isMobile ? '' : 'max-w-4xl'}`}>
                {/* Header */}
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-3`}>
                    {selectedItem.title}
                  </h1>
                  <p className={`text-white/70 ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
                    {selectedItem.description}
                  </p>
                </div>

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 text-sm font-medium rounded-full bg-white/10 text-white/90 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                {(selectedItem.liveUrl || selectedItem.githubUrl) && (
                  <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
                    {selectedItem.liveUrl && (
                      <a
                        href={selectedItem.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-5 py-3 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-white/10`}
                        style={{ minHeight: '44px' }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Live
                      </a>
                    )}
                    {selectedItem.githubUrl && (
                      <a
                        href={selectedItem.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-5 py-3 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-white/10`}
                        style={{ minHeight: '44px' }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </a>
                    )}
                  </div>
                )}

                {/* Markdown Content */}
                {selectedItem.content && (
                  <div className="border-t border-white/10 pt-6">
                    <div className={getMarkdownClasses(isMobile)}>
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {selectedItem.content}
                      </Markdown>
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {selectedItem.gallery && selectedItem.gallery.length > 0 && (
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <h3 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wide">Gallery</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedItem.gallery.map((img, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg overflow-hidden aspect-video bg-white/5 border border-white/5"
                        >
                          <img
                            src={img}
                            alt={`${selectedItem.title} ${idx + 1}`}
                            loading="lazy"
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 protect-photo"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center text-center ${isMobile ? 'py-24 px-4' : 'py-20 px-6'}`}>
              <div className="mb-6">
                <svg
                  className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} text-white/20 mx-auto mb-4`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white/70 mb-3`}>
                Welcome to the Archive
              </h3>
              <p className={`text-white/50 ${isMobile ? 'text-sm' : 'text-base'} max-w-md leading-relaxed`}>
                {isMobile
                  ? 'Tap the menu button to browse categories and articles.'
                  : 'Expand a category on the left and select any article or project that catches your interest to dive in.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Archive

