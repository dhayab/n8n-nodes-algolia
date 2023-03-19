import typescript from '@rollup/plugin-typescript';
import { fdir } from 'fdir';
import shelljs from 'shelljs';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json';

let n8nProcess;
export default defineConfig({
	build: {
		lib: {
			entry: new fdir()
				.withRelativePaths()
				.glob('credentials/*.credentials.ts', 'nodes/**/*.node.ts')
				.crawl('.')
				.sync()
				.reduce((entries, entry) => ({ ...entries, [entry.replace(/\.[^/.]+$/, '')]: entry }), {}),
			formats: ['cjs'],
		},
		emptyOutDir: true,
		target: 'esnext',
		minify: false,
		rollupOptions: {
			output: {
				chunkFileNames: `${pkg.name}.[hash].js`,
			},
		},
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'nodes/**/*.{json,svg}',
					dest: '.',
					rename(filename, extension, fullPath) {
						return fullPath;
					},
				},
			],
		}),
		typescript(),
		{
			name: 'n8n',
			async closeBundle() {
				if (!this.meta.watchMode) {
					return;
				}

				if (n8nProcess) {
					n8nProcess.kill();
				}

				n8nProcess = shelljs.exec('n8n', { async: true }, (code, stdout, stderr) => {
					if (code !== 0) {
						this.warn(
							[
								'\nCould not start n8n for the following reason:',
								`→ ${stderr.trim()}`,
								'\nSet up local testing by following the instructions here:',
								'→ https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally',
							].join('\n'),
						);
					}
				});
			},
		},
	],
});
