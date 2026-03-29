import { svelte } from '@sveltejs/vite-plugin-svelte';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
	causal_diagram_widget: {
		entry: './src/api/causal_diagram_widget.mjs',
		name: 'CausalDiagramWidget',
		fileName: 'causal-diagram-widget-standalone.mjs',
	},
	animation_widget: {
		entry: './src/api/animation_widget.mjs',
		name: 'AnimationWidget',
		fileName: 'animation-widget-standalone.mjs',
	},
}[process.env.BUILD_TARGET];

const cwd = process.cwd()

export default {
	plugins: [
		replace({
			preventAssignment: true,
			'import.meta.env.VITE_SERVERTYPE': JSON.stringify(process.env.VITE_SERVERTYPE),
			'import.meta.env.DEV': dev.toString(),
		}),
		alias({
			entries: {
				'$lib': cwd + '/src/lib',
				'$app/environment': cwd + '/src/api/env.js',
				//'$app':     '.svelte-kit/build/runtime/app',
			},
		}),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev,
				accessors: true,
				// we'll extract any component CSS out into
				// a separate file - better for performance
				// css: css => { css.write('animation-widget.css'); }
				hmr: false,
			},
			emitCss: false
		}),
	],
	build: {
		outDir: "./static/api/",
		emptyOutDir: false,
		lib: {
			...config,
		},
		sourcemap: true,
		rolldownOptions: {
			output: [
				{
					format: 'esm',
					entryFileNames: config.fileName,
					codeSplitting: false
				},
				{
					format: 'iife',
					name: config.name,
					entryFileNames: config.fileName.replace(/\.mjs$/, '.js'),
					codeSplitting: false
				}
			],
		},
	},
};
