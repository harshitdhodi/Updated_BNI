// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "BCONN",
        short_name: "BCONN",
        description: "BCONN Progressive Web App",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/icons/BNI1-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/BNI1-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
      },

      devOptions: {
        enabled: true, // Enable PWA in development
      }
    })
  ],

  server: {
    mimeTypes: {
      'application/javascript': ['js'],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
      }
    }
  }
});
