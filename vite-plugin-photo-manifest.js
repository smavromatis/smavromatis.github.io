import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Vite plugin to auto-generate photo manifest with optimized images
 * - Scans public/photos directory
 * - Creates optimized versions for faster loading
 * - Generates manifest with both original and optimized paths
 * - Originals used for full-quality viewing, optimized for dome gallery
 */
export default function photoManifestPlugin() {
  const photosDir = 'public/photos';
  const optimizedDir = 'public/photos/optimized';
  const manifestPath = path.join(photosDir, 'manifest.json');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  // Optimization settings
  const OPTIMIZED_MAX_WIDTH = 1200;
  const OPTIMIZED_QUALITY = 75;

  async function optimizeImage(inputPath, outputPath) {
    try {
      await sharp(inputPath)
        .resize(OPTIMIZED_MAX_WIDTH, OPTIMIZED_MAX_WIDTH, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .withMetadata({
          exif: {
            IFD0: {
              Artist: 'Stylianos Mavromatis',
              Copyright: 'Stylianos Mavromatis - All rights reserved'
            }
          }
        })
        .jpeg({ quality: OPTIMIZED_QUALITY, mozjpeg: true })
        .toFile(outputPath);

      return true;
    } catch (error) {
      console.error(`Error optimizing ${inputPath}:`, error.message);
      return false;
    }
  }

  async function generateManifest() {
    try {
      // Check if photos directory exists
      if (!fs.existsSync(photosDir)) {
        console.log('📸 No photos directory found, skipping manifest generation');
        return;
      }

      // Create optimized directory if it doesn't exist
      if (!fs.existsSync(optimizedDir)) {
        fs.mkdirSync(optimizedDir, { recursive: true });
      }

      // Read all files in photos directory
      const files = fs.readdirSync(photosDir);

      // Filter for image files only
      const photoFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      }).sort();

      // Shuffle array for better variety around the dome
      // Fisher-Yates shuffle algorithm
      for (let i = photoFiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photoFiles[i], photoFiles[j]] = [photoFiles[j], photoFiles[i]];
      }

      if (photoFiles.length === 0) {
        console.log('📸 No photos found');
        return;
      }

      console.log(`📸 Processing ${photoFiles.length} photo(s)...`);

      // Process each photo
      const photos = [];
      for (const filename of photoFiles) {
        const inputPath = path.join(photosDir, filename);
        const optimizedFilename = filename.replace(/\.[^/.]+$/, '.jpg'); // Convert all to .jpg
        const optimizedPath = path.join(optimizedDir, optimizedFilename);

        // Check if optimized version needs to be created/updated
        let needsOptimization = true;
        if (fs.existsSync(optimizedPath)) {
          const originalStats = fs.statSync(inputPath);
          const optimizedStats = fs.statSync(optimizedPath);
          // Only re-optimize if original is newer
          needsOptimization = originalStats.mtime > optimizedStats.mtime;
        }

        if (needsOptimization) {
          await optimizeImage(inputPath, optimizedPath);
        }

        photos.push({
          filename: filename,
          original: `photos/${filename}`,
          optimized: `photos/optimized/${optimizedFilename}`
        });
      }

      // Calculate size savings
      const originalSize = photoFiles.reduce((sum, file) => {
        const stats = fs.statSync(path.join(photosDir, file));
        return sum + stats.size;
      }, 0);

      const optimizedSize = photoFiles.reduce((sum, file) => {
        const optimizedFilename = file.replace(/\.[^/.]+$/, '.jpg');
        const optimizedPath = path.join(optimizedDir, optimizedFilename);
        if (fs.existsSync(optimizedPath)) {
          const stats = fs.statSync(optimizedPath);
          return sum + stats.size;
        }
        return sum;
      }, 0);

      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

      // Create manifest
      const manifest = {
        photos: photos,
        count: photos.length,
        optimization: {
          originalSize: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
          optimizedSize: `${(optimizedSize / 1024 / 1024).toFixed(2)} MB`,
          savings: `${savings}%`
        },
        lastUpdated: new Date().toISOString()
      };

      // Write manifest file
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      console.log(`✅ Generated manifest with ${photos.length} photo(s)`);
      console.log(`   Original: ${manifest.optimization.originalSize} → Optimized: ${manifest.optimization.optimizedSize}`);
      console.log(`   Size reduction: ${savings}% 🎉`);
    } catch (error) {
      console.error('Error generating photo manifest:', error);
    }
  }

  return {
    name: 'vite-plugin-photo-manifest',

    // Generate manifest when plugin is initialized
    async buildStart() {
      await generateManifest();
    },

    // Watch for file changes in development
    configureServer(server) {
      if (!fs.existsSync(photosDir)) return;

      const watcher = fs.watch(photosDir, { recursive: false }, async (eventType, filename) => {
        if (filename && filename !== 'manifest.json' && !filename.startsWith('.')) {
          const ext = path.extname(filename).toLowerCase();
          if (imageExtensions.includes(ext)) {
            console.log(`📸 Photo change detected: ${filename}`);
            await generateManifest();

            // Trigger HMR to reload the photos
            server.ws.send({
              type: 'full-reload',
              path: '*'
            });
          }
        }
      });

      // Cleanup watcher on server close
      server.httpServer?.on('close', () => {
        watcher.close();
      });
    }
  };
}
