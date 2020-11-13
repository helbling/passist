import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export default {
	input: './src/components/AnimationWidget.svelte',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'AnimationWidget',
		globals: {
			three: 'THREE',
			'three/examples/jsm/controls/OrbitControls.js': 'OrbitControls',
		},
		file: 'static/passist-animation-widget.js',
	},
	external: ['three', 'three/examples/jsm/controls/OrbitControls.js'],
	plugins: [
		replace({
			'process.browser': true,
			'process.env.NODE_ENV': JSON.stringify(mode)
		}),
		svelte({
			// enable run-time checks when not in production
			dev,
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css: css => {
				css.write('passist-animation-widget.css');
			}
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
		commonjs(),
	],
	watch: {
		clearScreen: false
	}
};
