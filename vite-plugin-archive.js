import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Vite plugin to auto-load archive items from markdown files across multiple categories
 * - Scans public/archive directory for category folders (e.g., projects/, articles/)
 * - Each folder becomes a category
 * - Parses frontmatter for metadata
 * - Automatically resolves relative image paths
 * - Creates virtual module for import
 * 
 * Recommended Structure (each item in its own folder):
 *   public/archive/
 *     articles/
 *       my-article/
 *         index.md (or my-article.md, article.md)
 *         hero.jpg
 *         screenshot1.png
 *     projects/
 *       cool-project/
 *         index.md
 *         demo.gif
 * 
 * Legacy Structure (still supported):
 *   public/archive/
 *     articles/
 *       article1.md
 *       article2.md
 * 
 * In your markdown, reference images with relative paths:
 *   ![Hero Image](./hero.jpg)
 *   ![Screenshot](screenshot1.png)
 * 
 * Frontmatter fields:
 *   - title: string (required)
 *   - description: string (required)
 *   - image: string (optional, relative path or URL)
 *   - tags: array (optional)
 *   - liveUrl: string (optional)
 *   - githubUrl: string (optional)
 *   - gallery: array (optional, relative paths or URLs)
 *   - order: number (optional, for sorting)
 */
export default function archivePlugin() {
  const archiveDir = 'public/archive';
  const virtualModuleId = 'virtual:archive';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  async function loadArchive() {
    try {
      // Check if archive directory exists
      if (!fs.existsSync(archiveDir)) {
        console.log('📝 No archive directory found at public/archive/');
        console.log('   Creating directory with default categories...');
        fs.mkdirSync(archiveDir, { recursive: true });
        fs.mkdirSync(path.join(archiveDir, 'projects'), { recursive: true });
        fs.mkdirSync(path.join(archiveDir, 'articles'), { recursive: true });
        return { categories: [], items: [] };
      }

      // Read all subdirectories (categories)
      const entries = fs.readdirSync(archiveDir, { withFileTypes: true });
      const categoryFolders = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name);

      if (categoryFolders.length === 0) {
        console.log('📝 No category folders found in public/archive/');
        console.log('   Creating default categories...');
        fs.mkdirSync(path.join(archiveDir, 'projects'), { recursive: true });
        fs.mkdirSync(path.join(archiveDir, 'articles'), { recursive: true });
        return {
          categories: [
            { id: 'projects', name: 'Projects', count: 0 },
            { id: 'articles', name: 'Articles', count: 0 }
          ],
          items: []
        };
      }

      console.log(`📝 Found ${categoryFolders.length} category/categories: ${categoryFolders.join(', ')}`);

      // Process each category
      const allItems = [];
      const categories = [];

      for (const categoryId of categoryFolders) {
        const categoryPath = path.join(archiveDir, categoryId);

        // Process each markdown file
        const categoryItems = [];

        function findItems(dirPath, currentSubcategory = null) {
          let items = [];
          const dirEntries = fs.readdirSync(dirPath, { withFileTypes: true });

          for (const entry of dirEntries) {
            if (entry.name.startsWith('.')) continue;

            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
              const possibleFiles = [
                'index.md',
                `${entry.name}.md`,
                'article.md',
                'project.md'
              ];

              let foundFile = null;
              for (const pf of possibleFiles) {
                if (fs.existsSync(path.join(fullPath, pf))) {
                  foundFile = pf;
                  break;
                }
              }

              if (foundFile) {
                items.push({
                  filepath: path.join(fullPath, foundFile),
                  filename: foundFile,
                  itemId: currentSubcategory ? `${categoryId}-${currentSubcategory.replace(/\\|\//g, '-')}-${entry.name}` : `${categoryId}-${entry.name}`,
                  basePath: currentSubcategory ? `/archive/${categoryId}/${currentSubcategory}/${entry.name}` : `/archive/${categoryId}/${entry.name}`,
                  subcategory: currentSubcategory
                });
              } else {
                // It's a subcategory folder!
                const newSubcategory = currentSubcategory ? `${currentSubcategory}/${entry.name}` : entry.name;
                items.push(...findItems(fullPath, newSubcategory));
              }
            } else if (entry.name.endsWith('.md')) {
              items.push({
                filepath: fullPath,
                filename: entry.name,
                itemId: currentSubcategory ? `${categoryId}-${currentSubcategory.replace(/\\|\//g, '-')}-${path.basename(entry.name, '.md')}` : `${categoryId}-${path.basename(entry.name, '.md')}`,
                basePath: currentSubcategory ? `/archive/${categoryId}/${currentSubcategory}` : `/archive/${categoryId}`,
                subcategory: currentSubcategory
              });
            }
          }
          return items;
        }

        const rawItems = findItems(categoryPath);

        for (const rawItem of rawItems) {
          const { filepath, filename, itemId, basePath, subcategory } = rawItem;
          const fileContents = fs.readFileSync(filepath, 'utf8');

          // Parse frontmatter and content
          const { data: frontmatter, content } = matter(fileContents);

          // Validate required fields
          if (!frontmatter.title || !frontmatter.description) {
            console.warn(`⚠️  Skipping ${filepath}: missing required fields (title, description)`);
            continue;
          }

          // Process content to resolve relative image paths
          let processedContent = content;
          // Replace relative image paths with absolute paths from /archive
          processedContent = processedContent.replace(
            /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
            `![$1](${basePath}/$2)`
          );
          processedContent = processedContent.replace(
            /!\[([^\]]*)\]\(([^:/][^)]+)\)/g, // Matches images without protocol
            (match, alt, imagePath) => {
              // Don't replace if it already starts with /archive or is an absolute URL
              if (imagePath.startsWith('/archive') || imagePath.startsWith('http')) {
                return match;
              }
              return `![${alt}](${basePath}/${imagePath})`;
            }
          );

          // Process frontmatter image paths
          let heroImage = frontmatter.image || null;
          if (heroImage && !heroImage.startsWith('http') && !heroImage.startsWith('/')) {
            heroImage = `${basePath}/${heroImage}`;
          }

          // Process gallery image paths
          let gallery = frontmatter.gallery || [];
          if (gallery.length > 0) {
            gallery = gallery.map(img => {
              if (!img.startsWith('http') && !img.startsWith('/')) {
                return `${basePath}/${img}`;
              }
              return img;
            });
          }

          // Create item object with processed markdown
          const item = {
            id: itemId,
            category: categoryId,
            subcategory: subcategory, // New attribute for subcategory grouping!
            title: frontmatter.title,
            description: frontmatter.description,
            content: processedContent, // Processed markdown with resolved paths
            image: heroImage,
            tags: frontmatter.tags || [],
            liveUrl: frontmatter.liveUrl || null,
            githubUrl: frontmatter.githubUrl || null,
            gallery: gallery,
            order: frontmatter.order || 999,
            // Store original filename for reference
            _filename: filename,
            _category: categoryId,
            _basePath: basePath
          };

          categoryItems.push(item);
        }

        // Sort items in this category by order
        categoryItems.sort((a, b) => a.order - b.order);

        // Add to all items
        allItems.push(...categoryItems);

        // Create category metadata
        const categoryName = categoryId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        categories.push({
          id: categoryId,
          name: categoryName,
          count: categoryItems.length
        });

        console.log(`   ✅ ${categoryName}: ${categoryItems.length} item(s)`);
      }

      console.log(`✅ Loaded ${allItems.length} total item(s) across ${categories.length} category/categories`);

      return {
        categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
        items: allItems
      };
    } catch (error) {
      console.error('Error loading archive:', error);
      return { categories: [], items: [] };
    }
  }

  let archiveData = { categories: [], items: [] };

  return {
    name: 'vite-plugin-archive',

    // Load archive when plugin is initialized
    async buildStart() {
      archiveData = await loadArchive();
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
        return `export const archive = ${JSON.stringify(archiveData, null, 2)};`;
      }
    },

    // Watch for file changes in development
    configureServer(server) {
      // Ensure archive directory exists
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const watcher = fs.watch(archiveDir, { recursive: true }, async (eventType, filename) => {
        if (filename && (filename.endsWith('.md') || eventType === 'rename')) {
          console.log(`📝 Archive change detected: ${filename || 'directory change'}`);
          archiveData = await loadArchive();

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

