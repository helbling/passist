import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import svelte from 'rollup-plugin-svelte';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export default {
	input: './src/components/AnimationWidget.svelte',
	output: [
		{
			sourcemap: true,
			format: 'esm',
			file: 'static/api/animation-widget-standalone.mjs',
			inlineDynamicImports: true,
		},
		{
			sourcemap: true,
			format: 'iife',
			name: 'AnimationWidget',
			file: 'static/api/animation-widget-standalone.js',
			inlineDynamicImports: true,
		}
	],
	plugins: [
		replace({
			preventAssignment: true,
			'import.meta.env.VITE_SERVERTYPE': JSON.stringify(process.env.VITE_SERVERTYPE),
			'import.meta.env.DEV': dev.toString(),
		}),
		alias({
			entries: {
				'$lib':     'src/lib',
				'$app/env': 'src/api/env.js',
				//'$app':     '.svelte-kit/build/runtime/app',
			},
		}),
		svelte({
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
		!dev && terser(),
	],
	watch: {
		clearScreen: false
	}
};
