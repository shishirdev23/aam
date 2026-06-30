import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});
