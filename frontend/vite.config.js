import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public',
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  root: './',
  base: '/',
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'landP.html'),
        admin: resolve(__dirname, 'admin-dashboard.html'),
        farmer: resolve(__dirname, 'farmer-dashboard.html'),
        delivery: resolve(__dirname, 'delivery-dashboard.html'),
        login: resolve(__dirname, 'login-registration.html'),
        cart: resolve(__dirname, 'user-cart-page.html'),
        checkout: resolve(__dirname, 'user-checkout-page.html'),
        user: resolve(__dirname, 'user-dashboard.html'),
        products: resolve(__dirname, 'product-list.html'),
        product: resolve(__dirname, 'pdp.html'),
        tracking: resolve(__dirname, 'delivery-tracking.html')
      }
    }
  }
});
