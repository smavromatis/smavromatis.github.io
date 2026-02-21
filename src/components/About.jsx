import React, { useState, useEffect } from 'react'

const About = () => {
  const [aboutData, setAboutData] = useState({
    name: "Loading...",
    title: "",
    bio: [],
    imagePath: "",
    links: {
      github: "",
      linkedin: "",
      resume: ""
    }
  });

  useEffect(() => {
    fetch('/content.json')
      .then(res => res.json())
      .then(data => {
        if (data.about) {
          setAboutData(data.about);
        }
      })
      .catch(err => console.error("Error loading about data:", err));
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-96px)] flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-0">
      <div className="max-w-5xl mx-auto w-full">
        {/* Two-column layout: Photo left, Content right */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column - Profile Picture */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 shadow-2xl">
              {aboutData.imagePath ? (
                <img
                  src={aboutData.imagePath}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-40 h-40 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Name & Title */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center lg:text-left">{aboutData.name}</h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/70 font-light text-center lg:text-left">{aboutData.title}</p>
            </div>

            {/* Bio */}
            <div className="space-y-3 sm:space-y-4 pt-2">
              {aboutData.bio.map((paragraph, index) => (
                <p key={index} className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed text-center lg:text-left">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Social Links & Resume */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-4 justify-center lg:justify-start">
              {/* GitHub */}
              {aboutData.links?.github && (
                <a
                  href={aboutData.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 active:bg-white/25 hover:border-white/20 active:border-white/25 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="GitHub"
                  style={{ minHeight: '44px' }}
                >
                  <svg
                    className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">GitHub</span>
                </a>
              )}

              {/* LinkedIn */}
              {aboutData.links?.linkedin && (
                <a
                  href={aboutData.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 active:bg-white/25 hover:border-white/20 active:border-white/25 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="LinkedIn"
                  style={{ minHeight: '44px' }}
                >
                  <svg
                    className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">LinkedIn</span>
                </a>
              )}

              {/* Resume Download Button */}
              {aboutData.links?.resume && (
                <a
                  href={aboutData.links.resume}
                  download
                  className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 active:bg-white/20 hover:border-white/25 active:border-white/30 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  aria-label="Download Resume"
                  style={{ minHeight: '44px' }}
                >
                  <svg
                    className="w-5 h-5 text-white/60 group-hover:text-white transition-all duration-300 group-hover:translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    Resume
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
