import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({
        importStyle: 'sass',
      })],
    }),
    {
      name: 'simple-db-middleware',
      configureServer(server) {
        server.middlewares.use('/api/data', (req, res, next) => {
          const dataPath = path.resolve(process.cwd(), 'data.json')
          
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(dataPath)) {
                const content = fs.readFileSync(dataPath, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.end(content || '[]')
              } else {
                res.setHeader('Content-Type', 'application/json')
                res.end('[]')
              }
            } catch (e) {
              console.error('Error reading data.json', e)
              res.statusCode = 500
              res.end('[]')
            }
            return
          }
          
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                // Basic validation
                JSON.parse(body)
                fs.writeFileSync(dataPath, body)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                console.error('Error writing data.json', e)
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to save data' }))
              }
            })
            return
          }
          
          next()
        })
      }
    },
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Idea Card Manager',
        short_name: 'IdeaCards',
        description: 'Manage your ideas efficiently',
        theme_color: '#4a90e2',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
