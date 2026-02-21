import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Vite plugin to auto-load projects from markdown files
 * - Scans public/projects directory for .md files
 * - Parses frontmatter for metadata
 * - Keeps raw markdown for react-markdown to render
 * - Creates virtual module for import
 * 
 * Usage: Just drop a .md file in public/projects/
 * Frontmatter fields:
 *   - title: string (required)
 *   - description: string (required)
 *   - image: string (optional, URL or path)
 *   - tags: array (optional)
 *   - liveUrl: string (optional)
 *   - githubUrl: string (optional)
 *   - gallery: array (optional, image URLs)
 *   - order: number (optional, for sorting)
 */
export default function projectsPlugin() {
  const projectsDir = 'public/projects';
  const virtualModuleId = 'virtual:projects';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  async function loadProjects() {
    try {
      // Check if projects directory exists
      if (!fs.existsSync(projectsDir)) {
        console.log('📝 No projects directory found at public/projects/');
        console.log('   Creating directory...');
        fs.mkdirSync(projectsDir, { recursive: true });
        return [];
      }

      // Read all markdown files in projects directory
      const files = fs.readdirSync(projectsDir);
      const markdownFiles = files.filter(file => 
        file.endsWith('.md') && !file.startsWith('.')
      );

      if (markdownFiles.length === 0) {
        console.log('📝 No project markdown files found in public/projects/');
        return [];
      }

      console.log(`📝 Loading ${markdownFiles.length} project(s)...`);

      // Process each markdown file
      const projects = [];
      for (const filename of markdownFiles) {
        const filepath = path.join(projectsDir, filename);
        const fileContents = fs.readFileSync(filepath, 'utf8');
        
        // Parse frontmatter and content
        const { data: frontmatter, content } = matter(fileContents);
        
        // Validate required fields
        if (!frontmatter.title || !frontmatter.description) {
          console.warn(`⚠️  Skipping ${filename}: missing required fields (title, description)`);
          continue;
        }

        // Create project object with raw markdown
        const project = {
          id: path.basename(filename, '.md'),
          title: frontmatter.title,
          description: frontmatter.description,
          content: content, // Keep raw markdown for react-markdown
          image: frontmatter.image || null,
          tags: frontmatter.tags || [],
          liveUrl: frontmatter.liveUrl || null,
          githubUrl: frontmatter.githubUrl || null,
          gallery: frontmatter.gallery || [],
          order: frontmatter.order || 999,
          // Store original filename for reference
          _filename: filename
        };

        projects.push(project);
      }

      // Sort by order field (lower numbers first)
      projects.sort((a, b) => a.order - b.order);

      console.log(`✅ Loaded ${projects.length} project(s)`);
      return projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  let projectsData = [];

  return {
    name: 'vite-plugin-projects',
    
    // Load projects when plugin is initialized
    async buildStart() {
      projectsData = await loadProjects();
    },

    // Resolve virtual module
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    // Load virtual module content
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const projects = ${JSON.stringify(projectsData, null, 2)};`;
      }
    },

    // Watch for file changes in development
    configureServer(server) {
      // Ensure projects directory exists
      if (!fs.existsSync(projectsDir)) {
        fs.mkdirSync(projectsDir, { recursive: true });
      }

      const watcher = fs.watch(projectsDir, { recursive: false }, async (eventType, filename) => {
        if (filename && filename.endsWith('.md') && !filename.startsWith('.')) {
          console.log(`📝 Project change detected: ${filename}`);
          projectsData = await loadProjects();
          
          // Invalidate the virtual module to trigger HMR
          const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          
          // Trigger HMR
          server.ws.send({
            type: 'full-reload',
            path: '*'
          });
        }
      });

      // Cleanup watcher on server close
      server.httpServer?.on('close', () => {
        watcher.close();
      });
    }
  };
}

