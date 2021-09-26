<script>
	import { defaults, useLocalStorage, U } from '$lib/passist.mjs';
	import { goto } from '$app/navigation';

	if (useLocalStorage) {
		const siteswapInput = localStorage.getItem('siteswap') || defaults.siteswap;
		const nJugglers = localStorage.getItem('nJugglers') || 2;
		goto(U(
			'/siteswap-alternatives/'
			+ ((typeof siteswapInput === 'string') ? siteswapInput.replace(/[^0-9a-zA-Z]+/g, '') : ''),
			{ nJugglers }
		));
	}
</script>
