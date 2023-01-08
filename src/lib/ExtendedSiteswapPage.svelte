<script>
	import PatternResult from '$lib/PatternResult.svelte';
	import ExtendedSiteswapInput from '$lib/ExtendedSiteswapInput.svelte';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, limbs2hands, hands2limbs, U} from '$lib/passist.mjs';
	import { siteswapNames} from '$lib/patterns.mjs';

	export let init;
	let nJugglers = defaults.nJugglers;
	let jif = {};
	let input = ['3p33', '234p'];
	let valid = false;
	let individualPatterns = true;
	let extendedSiteswapNotation = '';
	let extendedSiteswap;
	let period;
	let nProps;
	let siteswapName;
	let title;
	let url;

	function unserialize(str) {
		if (str.match(/^<.*>$/))
			return str.slice(1, -1).split('|');
		return str.split('/');
	}
	function serialize(input) {
		return input.join('/');
	}
	if (init) {
		input = unserialize(init.params.input);

		const nJugglersUrl = parseInt(init.url.searchParams.get('jugglers'));
		if (nJugglersUrl && nJugglersUrl >= 1) {
			nJugglers = nJugglersUrl;
			individualPatterns = false;
			input = Array(nJugglers).fill(input[0])
		} else {
			individualPatterns = true;
			nJugglers = input.length;
		}
	} else if (useLocalStorage) {
		nJugglers = localStorage.getItem('extended-siteswap/nJugglers') || defaults.nJugglers;
		const localStorageInput = localStorage.getItem('extended-siteswap/input');
		if (localStorageInput) {
			input = unserialize(localStorageInput);
			individualPatterns = true; // TODO: save/restore that one as well! (save full url?)
		}
	}

	$: useLocalStorage && nJugglers && localStorage.setItem("extended-siteswap/nJugglers", nJugglers);
	$: useLocalStorage && input.every(x => x) && localStorage.setItem("extended-siteswap/input", serialize(input));

	// TODO: make sure causal diagram works

	$:{
		extendedSiteswapNotation = '<' + input.join('|') + '>';
		extendedSiteswap = new ExtendedSiteswap(extendedSiteswapNotation);
		valid = extendedSiteswap.isValid();
		siteswapName = siteswapNames[extendedSiteswap.nJugglers + '|' + extendedSiteswap.toString()];
		title = 'Extended Siteswap ' + extendedSiteswapNotation;
		if (individualPatterns)
			url = U('/extended-siteswap/' + serialize(input), {});
		else
			url = U('/extended-siteswap/' + input[0], {jugglers:nJugglers});

		if (valid) {
			jif = extendedSiteswap.toJif({
				name: siteswapName ? siteswapName + " (" + extendedSiteswap.toString() + ")" : undefined,
				generator: 'passist', // TODO: put version of package.json here again
				flipTwos: true, // TODO: implement this
			});
			nProps = extendedSiteswap.nProps();
		}
	}
</script>

<PatternResult {valid} {jif} {title} {url} {init}>

	<ExtendedSiteswapInput
		slot=input
		bind:nJugglers
		bind:siteswapInputs={input}
		bind:individualPatterns
		siteswapValid={valid}
		idPrefix=main
	/>
	<ExtendedSiteswapInput
		showNJugglers={false}
		slot=animation_input
		bind:siteswapInputs={input}
		siteswapValid={valid}
		{nJugglers}
		idPrefix=animation
	/>

	<div slot=info>

	{#if valid}
		<p>
			{extendedSiteswapNotation} - {nProps} props
		</p>
		<p>
			Note: Support for extended siteswaps is new and might still have some bugs and rough edges..
		</p>

	{:else}
		<!-- empty string as input: no output -->
	{/if}
	</div>

</PatternResult>
