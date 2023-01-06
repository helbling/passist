<script>
	import PatternResult from '$lib/PatternResult.svelte';
	import ExtendedSiteswapInput from '$lib/ExtendedSiteswapInput.svelte';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, limbs2hands, hands2limbs, U} from '$lib/passist.mjs';
	import { siteswapNames} from '$lib/patterns.mjs';

	export let nJugglers = defaults.nJugglers;
	export let input = ['3p33', '234p'];
	export let valid = false;
	export let jif = {};
	export let init;
	let notation = '';
	let extendedSiteswap;
	let period;
	let nProps;
	let siteswapName;
	let title;
	let url;
	let individualPatterns = false;

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
		if (init.url.searchParams.get('jugglers')) {
			individualPatterns = false;
			input = Array(nJugglers).fill(input[0])
		} else {
			individualPatterns = true;
			nJugglers = input.length;
		}
	} else if (useLocalStorage) {
		const localStorageInput = localStorage.getItem('simultaneous-siteswap');
		if (localStorageInput)
			input = unserialize(localStorageInput);
	}

	$: useLocalStorage && input.every(x => x) && localStorage.setItem("simultaneous-siteswap", serialize(input));

	// TODO: make sure causal diagram works

	$:{
		notation = '<' + input.join('|') + '>';
		extendedSiteswap = new ExtendedSiteswap(notation);
		valid = extendedSiteswap.isValid();
		siteswapName = siteswapNames[extendedSiteswap.nJugglers + '|' + extendedSiteswap.toString()];
		title = 'Extended Siteswap ' + notation;
		if (individualPatterns)
			url = U('/simultaneous-siteswap/' + serialize(input), {});
		else
			url = U('/simultaneous-siteswap/' + input[0], {jugglers:nJugglers});

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
		showNJugglers={false}
		slot=input
		bind:siteswapInputs={input}
		bind:individualPatterns
		siteswapValid={valid}
		{nJugglers}
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
			{notation} - {nProps} props
		</p>
		<p>
			Note: Support for simultaneous siteswaps is new and might still have some bugs and rough edges..
		</p>

	{:else}
		<!-- empty string as input: no output -->
	{/if}
	</div>

</PatternResult>
