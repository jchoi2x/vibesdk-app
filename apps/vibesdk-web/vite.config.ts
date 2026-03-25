import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ['format', 'editor.all'],
		include: ['monaco-editor/esm/vs/editor/editor.api'],
		force: true,
	},
	plugins: [react(), svgr(), cloudflare({
		configPath: './wrangler.jsonc',
	}), tailwindcss() ],
	resolve: {
		alias: {
			debug: 'debug/src/browser',
			'@': path.resolve(__dirname, './src'),
		},
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
		global: 'globalThis',
	},
	worker: {
		format: 'es',
	},
	server: {
		allowedHosts: true,
		// In local dev, proxy /api/* to the vibesdk-api wrangler dev server.
		// vibesdk-api runs on port 8787 by default.
		// proxy: {
		// 	'/api': {
		// 		target: 'http://localhost:8787',
		// 		changeOrigin: true,
		// 	},
		// },
	},
	cacheDir: 'node_modules/.vite',
});
