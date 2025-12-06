// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import path from 'path';
import { fileURLToPath } from 'url';
import node from '@astrojs/node';

import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
    host: true, // Ascolta su tutte le interfacce (0.0.0.0)
  }),
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