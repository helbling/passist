import { svelte } from '@sveltejs/vite-plugin-svelte';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
	causal_diagram_widget: {
		entry: './src/lib/CausalDiagramWidget.svelte',
		name: 'CausalDiagramWidget',
		fileName: 'causal-diagram-widget-standalone.mjs',
	},
	animation_widget: {
		entry: './src/lib/AnimationWidget.svelte',
		name: 'AnimationWidget',
		fileName: 'animation-widget-standalone.mjs',
	},
}[process.env.BUILD_TARGET];

export default {
  plugins: [
	replace({
		preventAssignment: true,
		'import.meta.env.VITE_SERVERTYPE': JSON.stringify(process.env.VITE_SERVERTYPE),
		'import.meta.env.DEV': dev.toString(),
	}),
	alias({
		entries: {
			'$lib':     'src/lib',
			'$app/environment': 'src/api/env.js',
			//'$app':     '.svelte-kit/build/runtime/app',
		},
	}),
    svelte({
		hot: false, // hot module replacement hmr
		compilerOptions: {
			// enable run-time checks when not in production
			dev,
			accessors:true,
			// we'll extract any component CSS out into
			// a separate file - better for performance
			// css: css => { css.write('animation-widget.css'); }
		},
		emitCss: false
    }),

	// If you have external dependencies installed from
	// npm, you'll most likely need these plugins. In
	// some cases you'll need additional configuration -
	// consult the documentation for details:
	// https://github.com/rollup/plugins/tree/master/packages/commonjs
	resolve({
		browser: true,
		dedupe: ['svelte']
	}),
  ],
  build: {
    outDir: "./static/api/",
	emptyOutDir: false,
    lib: {
      ...config,
    },
  	rollupOptions: {
		output: [
			{
				sourcemap: true,
				format: 'esm',
				entryFileNames: config.fileName,
				inlineDynamicImports: true,
			},
			{
				sourcemap: true,
				format: 'iife',
				name: config.name,
				entryFileNames: config.fileName.replace(/\.mjs$/, '.js'),
				inlineDynamicImports: true,
			}
		],
    },
  },
};
