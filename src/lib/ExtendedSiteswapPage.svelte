<script>
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import ExtendedSiteswapInput from '$lib/ExtendedSiteswapInput.svelte';
	import InfoBox from '$lib/InfoBox.svelte';
	import PatternResult from '$lib/PatternResult.svelte';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, limbs2hands, hands2limbs, U} from '$lib/passist.mjs';
	import { siteswapNames} from '$lib/patterns.mjs';

	export let init = undefined;
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
	let urlSuffix;

	let inputStr, searchParams;
	if (init) {
		inputStr = init.params.input;
		searchParams = init.url.searchParams;
	} else if (useLocalStorage) {
		const urlSuffix = localStorage.getItem('extended-siteswap/urlSuffix');
		if (urlSuffix) {
			let queryStr
			[inputStr, queryStr] = urlSuffix.split('?');
			searchParams = new URLSearchParams(queryStr);
		}
	}

	if (inputStr) {
		if (inputStr.match(/^<.*>$/)) {
			/* if (inputStr.includes('|')) */
			// redirect!
			// TODO redirect <..|..> notation

			individualPatterns = false;

			const nJugglersUrl = parseInt(searchParams.get('jugglers'));
			if (nJugglersUrl && nJugglersUrl >= 1)
				nJugglers = nJugglersUrl;

			input = [inputStr.slice(1, -1)];

		} else {
			individualPatterns = true;
			input = inputStr.split('/');
			nJugglers = input.length;
		}
	}
	$: useLocalStorage && input.every(x => x) && localStorage.setItem("extended-siteswap/urlSuffix", urlSuffix);

	// TODO: make sure causal diagram works

	$:{
		extendedSiteswap = new ExtendedSiteswap(input, {individualPatterns, nJugglers});
		url = extendedSiteswap.toUrl();
		urlSuffix = extendedSiteswap.toUrlSuffix();
		extendedSiteswapString = extendedSiteswap.toString();
		valid = extendedSiteswap.isValid();
		siteswapName = siteswapNames[extendedSiteswap.nJugglers() + '|' + extendedSiteswap.notation];
		title = 'Extended Siteswap ' + extendedSiteswapString;

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
		<InfoBox type=warning>
			Note: Support for extended siteswaps is new and still has some bugs and rough edges..
		</InfoBox>

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
