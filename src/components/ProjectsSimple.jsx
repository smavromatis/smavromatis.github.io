import { useState, useEffect } from 'react'
import { projects } from 'virtual:projects'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/tokyo-night-dark.css'
import { cn } from '@/lib/utils'
import GlassSurface from '@/components/GlassSurface'

const markdownClasses = cn(
  'prose prose-invert prose-lg max-w-none',
  'prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight',
  'prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8',
  'prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3',
  'prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8',
  'prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-6',
  'prose-p:text-white/85 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.05rem]',
  'prose-a:text-blue-400 prose-a:no-underline prose-a:font-medium prose-a:border-b prose-a:border-blue-400/30 hover:prose-a:border-blue-400 hover:prose-a:text-blue-300 prose-a:transition-all',
  'prose-strong:text-white prose-strong:font-bold',
  'prose-em:text-white/90 prose-em:italic prose-em:not-italic',
  'prose-code:text-emerald-400 prose-code:bg-white/[0.08] prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:before:content-[\'\'] prose-code:after:content-[\'\'] prose-code:font-semibold',
  'prose-pre:!bg-[#1a1b26] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-2xl prose-pre:my-8',
  'prose-pre:code:!bg-transparent prose-pre:code:!p-0 prose-pre:code:!text-base prose-pre:code:!text-white/95 prose-pre:code:leading-relaxed prose-pre:code:font-normal prose-pre:code:!text-[#a9b1d6]',
  'prose-blockquote:border-l-4 prose-blockquote:border-blue-500/60 prose-blockquote:bg-blue-500/5 prose-blockquote:text-white/75 prose-blockquote:italic prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:my-6 prose-blockquote:not-italic',
  'prose-ul:text-white/85 prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2',
  'prose-ol:text-white/85 prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2',
  'prose-li:text-white/85 prose-li:leading-relaxed prose-li:text-[1.05rem]',
  'prose-li>prose-p:my-2',
  'prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:border prose-table:border-white/10 prose-table:rounded-lg prose-table:overflow-hidden',
  'prose-thead:bg-white/5',
  'prose-thead:border-b-2 prose-thead:border-white/20',
  'prose-th:text-white prose-th:font-bold prose-th:p-4 prose-th:text-left prose-th:border-r prose-th:border-white/10 prose-th:last:border-r-0',
  'prose-tbody:divide-y prose-tbody:divide-white/10',
  'prose-td:text-white/85 prose-td:p-4 prose-td:border-r prose-td:border-white/10 prose-td:last:border-r-0',
  'prose-tr:transition-colors hover:prose-tr:bg-white/5',
  'prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-8',
  'prose-hr:border-white/20 prose-hr:my-12'
)

const ProjectsSimple = () => {
  const [selectedId, setSelectedId] = useState(projects[0]?.id || null)
  const [isWideView, setIsWideView] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Safety check for projects
  if (!projects || projects.length === 0) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-white/60 text-lg">No projects found</p>
          <p className="text-white/40 text-sm mt-2">Add .md files to public/projects/</p>
        </div>
      </div>
    )
  }

  const selectedProject = projects.find(p => p.id === selectedId)

  return (
    <div
      className={`w-full flex gap-6 mx-auto ${isMobile ? 'px-4' : 'px-6'} transition-all duration-700 ease-in-out relative`}
      style={{ maxWidth: isWideView ? '1920px' : '1400px' }}
    >
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
          className="fixed left-6 top-24 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out"
          style={{
            height: 'calc(100vh - 220px)',
            width: '320px',
            maxWidth: '320px',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-white">Projects</h2>
              <button
                onClick={() => setIsWideView(!isWideView)}
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
            </div>
            <p className="text-white/40 text-xs">{projects.length} projects</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {projects.map((project) => {
              const isSelected = selectedId === project.id

              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedId(project.id)}
                  className={`group w-full text-left px-4 py-3 rounded-full transition-all duration-300 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 ${isSelected
                    ? 'bg-transparent text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    : 'bg-transparent text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    {project.image && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <img
                          src={project.image}
                          alt={project.title}
                          loading="lazy"
                          onContextMenu={(e) => e.preventDefault()}
                          className="w-full h-full object-cover protect-photo"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-1">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </button>
              )
            })}
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
                <div className="text-sm font-semibold text-white/90">Browse Projects</div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:bg-white/25"
                  aria-label="Close"
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Flat list of items */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {projects.map((project) => {
                  const isSelected = selectedId === project.id
                  return (
                    <button
                      key={project.id}
                      onClick={() => { setSelectedId(project.id); setIsSidebarOpen(false) }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl ${isSelected ? 'bg-white/15 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] border-white/30' : 'bg-white/5 hover:bg-white/10 active:bg-white/15'} text-white transition-all border border-white/10`}
                      style={{ minHeight: '48px' }}
                    >
                      <div className="flex items-center gap-3 text-left">
                        {project.image && <img src={project.image} alt="" className="w-8 h-8 rounded-lg object-cover protect-photo" onContextMenu={(e) => e.preventDefault()} loading="lazy" />}
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{project.title}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
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
            width={160}
            height={44}
            borderRadius={30}
            backgroundOpacity={0.15}
            saturation={1.8}
            borderWidth={0.1}
            brightness={80}
            opacity={0.8}
            blur={16}
            displace={1.5}
            distortionScale={-200}
            redOffset={0}
            greenOffset={15}
            blueOffset={30}
          >
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full h-full rounded-full flex items-center justify-center gap-2 px-4 backdrop-blur-sm active:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-white text-sm font-semibold tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Projects
              </span>
            </button>
          </GlassSurface>
        </div>
      )}

      {/* Right Panel - Project Details (Natural Scroll) */}
      <div className={`flex-1 min-w-0 ${isMobile ? 'w-full' : 'ml-80 pl-6'}`}>
        {selectedProject ? (
          <div className="space-y-6 pb-12">
            {/* Hero Image */}
            {selectedProject.image && (
              <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  loading="lazy"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover protect-photo"
                />
              </div>
            )}

            {/* Content */}
            <div className={`space-y-6 transition-all duration-700 ease-in-out ${isWideView ? '' : 'max-w-4xl'}`}>
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  {selectedProject.title}
                </h1>
                <p className="text-white/70 text-base leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Tags */}
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag, idx) => (
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
              {(selectedProject.liveUrl || selectedProject.githubUrl) && (
                <div className="flex gap-3">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 flex items-center gap-2 border border-white/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Live
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 flex items-center gap-2 border border-white/10"
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
              {selectedProject.content && (
                <div className="border-t border-white/10 pt-6">
                  <div className={markdownClasses}>
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {selectedProject.content}
                    </Markdown>
                  </div>
                </div>
              )}

              {/* Gallery */}
              {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wide">Gallery</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedProject.gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden aspect-video bg-white/5 border border-white/5"
                      >
                        <img
                          src={img}
                          alt={`${selectedProject.title} ${idx + 1}`}
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
          <div className="flex items-center justify-center text-white/40 py-20">
            <p>Select a project to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectsSimple

