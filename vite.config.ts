import { defineConfig } from 'vite';

declare const process: {
  env: Record<string, string | undefined>;
};

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
});
