// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
      resolve: {
          alias: {
              '@': path.resolve(__dirname, './src'),
              '@/': path.resolve(__dirname, './src/'),
          },
      },
  },

  integrations: [react()],
});