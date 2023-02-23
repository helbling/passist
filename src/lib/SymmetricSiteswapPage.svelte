<script>
	import SymmetricSiteswap from '$lib/symmetric_siteswap.mjs';
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import InfoBox from '$lib/InfoBox.svelte';
	import PatternResult from '$lib/PatternResult.svelte';
	import { defaults, useLocalStorage, symmetricSiteswapUrl } from '$lib/passist.mjs';
	import { siteswapNames } from '$lib/patterns.mjs';

	export let init = undefined;
	let nJugglers = defaults.nJugglers;
	let jif = {};
	let input = '3p33';
	let valid = false;
	let symmetricSiteswapString = '';
	let symmetricSiteswap;
	let period;
	let nProps;
	let siteswapName;
	let title;
	let url;
	let urlSuffix;

	if (init) {
		input = init.params.input;

		const nJugglersUrl = parseInt(init.url.searchParams.get('jugglers'));
		if (nJugglersUrl && nJugglersUrl >= 1)
			nJugglers = nJugglersUrl;

	} else if (useLocalStorage) {
		input = localStorage.getItem('symmetric-siteswap/input') || defaults.siteswap;
		nJugglers = localStorage.getItem('symmetric-siteswap/nJugglers') || defaults.nJugglers;
	}

	$: useLocalStorage && input && localStorage.setItem("symmetric-siteswap/input", input);
	$: useLocalStorage && nJugglers && localStorage.setItem("symmetric-siteswap/nJugglers", nJugglers);

	// TODO: make sure causal diagram works

	$:{
		title = 'Symmetric Siteswap ' + input;
		url = symmetricSiteswapUrl({
				siteswapInput: input,
				nJugglers: nJugglers,
		});
		symmetricSiteswap = new SymmetricSiteswap(input, {symmetric:true, nJugglers});
		valid = symmetricSiteswap.isValid();
		symmetricSiteswapString = symmetricSiteswap.toString();
		siteswapName = siteswapNames[url];

		jif = symmetricSiteswap.toJif({
			name: siteswapName ? siteswapName + " (" + symmetricSiteswap.toString() + ")" : undefined,
			flipTwos: true, // TODO: implement this
		});
		nProps = symmetricSiteswap.nProps;
	}
</script>

<PatternResult {valid} {jif} {title} {url} {init}>

	<SiteswapInput
		slot=input
		bind:nJugglers
		bind:siteswapInput={input}
		siteswapValid={valid}
		idPrefix=main
		showHandOrderInput={false}
	/>
	<SiteswapInput
		showNJugglers={false}
		slot=animation_input
		bind:siteswapInput={input}
		siteswapValid={valid}
		{nJugglers}
		idPrefix=animation
		showHandOrderInput={false}
	/>

	<div slot=info>

	{#if valid}
		<p>
			{symmetricSiteswapString}{siteswapName ? ' - ' + siteswapName : ''}
		</p>
		<p>
			{nProps} props
		</p>
	{:else if input}
		<div>
				<InfoBox type=error>
					<h5>Invalid Symmetric Siteswap</h5>
					{#if symmetricSiteswap && symmetricSiteswap.error}
						<p>
						{symmetricSiteswap.error}
						{#if symmetricSiteswap.error.snippet}
								<pre>{symmetricSiteswap.error.snippet}</pre>
						{/if}
						</p>
					{/if}
				 <img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
				</InfoBox>
		</div>
	{:else}
		<!-- empty string as input: no output -->
	{/if}
	<InfoBox type=warning>
		Note: Support for symmetric siteswaps is new and still has some bugs and rough edges..
	</InfoBox>

	</div>

</PatternResult>
