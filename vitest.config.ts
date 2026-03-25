import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

const runIntegrationTests = process.env.VIBESDK_RUN_INTEGRATION_TESTS === '1';

export default defineWorkersConfig({
	resolve: {
		alias: {
			'bun:test': 'vitest',
			'@': path.resolve(__dirname, './apps/vibesdk-api/src'),
		},
	},
	test: {
		globals: true,
		pool: '@cloudflare/vitest-pool-workers',
		deps: {
			optimizer: {
				ssr: {
					enabled: true,
					include: [
						'@cloudflare/containers',
						'@cloudflare/sandbox',
						'@babel/traverse',
						'@babel/types',
					],
				},
			},
		},
		poolOptions: {
			workers: {
				main: './apps/vibesdk-api/test/worker-entry.ts',
				wrangler: {
					configPath: './apps/vibesdk-api/wrangler.test.jsonc',
				},
				miniflare: {
					compatibilityDate: '2024-12-12',
					compatibilityFlags: ['nodejs_compat'],
				},
			},
		},
		include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.git/**',
			'**/src/api/routes/**',
			'**/test/worker-entry.ts',
			'**/container/monitor-cli.test.ts',
			'**/cf-git/**',
			'**/sdk/test/**',
			...(runIntegrationTests ? [] : ['**/sdk/test/integration/**']),
		],
	},
});
