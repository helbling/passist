<script>
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import ExtendedSiteswapInput from '$lib/ExtendedSiteswapInput.svelte';
	import InfoBox from '$lib/InfoBox.svelte';
	import PatternResult from '$lib/PatternResult.svelte';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, limbs2hands, hands2limbs, U} from '$lib/passist.mjs';
	import { siteswapNames} from '$lib/patterns.mjs';

	export let init;
	let nJugglers = defaults.nJugglers;
	let jif = {};
	let input = ['3p33', '234p'];
	let valid = false;
	let individualPatterns = true;
	let extendedSiteswapString = '';
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
		extendedSiteswap = new ExtendedSiteswap(input);
		extendedSiteswapString = extendedSiteswap.toString();
		valid = extendedSiteswap.isValid();
		siteswapName = siteswapNames[extendedSiteswap.nJugglers() + '|' + extendedSiteswap.notation];
		title = 'Extended Siteswap ' + extendedSiteswapString;
		if (individualPatterns)
			url = U('/extended-siteswap/' + serialize(input), {});
		else
			url = U('/extended-siteswap/' + input[0], {jugglers:nJugglers});

		if (valid) {
			jif = extendedSiteswap.toJif({
				name: siteswapName ? siteswapName + " (" + extendedSiteswap.toString() + ")" : undefined,
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
			{extendedSiteswapString}{siteswapName ? ' - ' + siteswapName : ''}
		</p>
		<p>
			{nProps} props
		</p>
		<p>
			Note: Support for extended siteswaps is new and still has some bugs and rough edges..
		</p>

	{:else if input.every(x => x)}
		<div>
				<InfoBox type=error>
					<h5>Invalid Extended Siteswap</h5>
					{#if extendedSiteswap && extendedSiteswap.error}
						<p>
						{extendedSiteswap.error}
						{#if extendedSiteswap.error.snippet}
								<pre>{extendedSiteswap.error.snippet}</pre>
						{/if}
						</p>
					{/if}
				 <img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
				</InfoBox>
		</div>
	{:else}
		<!-- empty string as input: no output -->
	{/if}
	</div>

</PatternResult>
