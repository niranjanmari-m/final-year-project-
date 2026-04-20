
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix if needed,
  // but here we rely on VITE_ prefix for security.
  // Fix: Cast process to any to access cwd() which may not be present in the default global Process type definition.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    root: 'frontend',
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '')
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
