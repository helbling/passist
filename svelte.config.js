import node from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: node(),
		target: '#svelte',
		vite: {
			ssr: {
				noExternal: ["three"]
			}
		},
	},
};
