<script>
	import { knownSiteswaps } from '$lib/patterns.mjs';
	import InputField from '$lib/InputField.svelte';
	let filter = '';
	let knownSiteswapsFiltered;
	const normalize = s => ('' + s).toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/ /g, '');
	$: knownSiteswapsFiltered = knownSiteswaps.filter(a => a.some(x => normalize(x).includes(normalize(filter))));
</script>

<style>
	li { text-overflow:ellipsis; overflow:hidden }
	li .siteswap { width:5.5em; vertical-align:top; overflow:hidden; text-overflow:ellipsis }
	span { display:inline-block; color:#212529 }
</style>

<div class="filter-form pure-form form-inline">
	<InputField
		bind:value={filter}
		type=search
		id=filter
		label='🔍'
		placeholder='filter query'
	/>
</div>

<h2>Well-known siteswaps</h2>

<p><small>© Christian Kästner, <a href='https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt'>named-siteswaps.txt</a></p>

<div class=pure-menu>
<ul class="pure-menu-list pure-g">
	{#if knownSiteswapsFiltered.length}
		{#each knownSiteswapsFiltered as s}
			<li class="pure-menu-item pure-u-1 pure-u-md-1-2 pure-u-lg-1-3">
				<a class=pure-menu-link href="/siteswap/{s[0]}?jugglers=2">
					<span class=siteswap>{s[0]}</span>
					<span class=name>{s[1]}</span>
				</a>
			</li>
		{/each}
	{:else}
		<div class="pure-u-1 pure-u-md-1-1 pure-u-lg-1-1">
			<p>No pattern found for "{filter}"</p>
			<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
		</div>
	{/if}
</ul>
</div>
