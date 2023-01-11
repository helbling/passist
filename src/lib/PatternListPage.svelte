<script>
	import { patterns } from '$lib/patterns.mjs';
	import InputField from '$lib/InputField.svelte';
	let filter = '';

	let patternsFiltered;
	let knownSiteswaps;
	let extendedSiteswaps;

	const normalize = s => ('' + s).toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/ /g, '');
$: {
	patternsFiltered = patterns.filter(a => [a.name, a.notation].some(x => normalize(x).includes(normalize(filter))));
	knownSiteswaps    = patternsFiltered.filter(p => p.source == 'known_siteswaps')
	extendedSiteswaps = patternsFiltered.filter(p => p.type == 'extended_siteswap');
}

</script>

<style>
	li { text-overflow:ellipsis; overflow:hidden }
	li .siteswap { width:5.5em; vertical-align:top; overflow:hidden; text-overflow:ellipsis }
	span { display:inline-block; color:#212529 }
	.pure-menu { margin-bottom:1em }
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
	{#if knownSiteswaps.length}
		{#each knownSiteswaps as pattern}
			<li class="pure-menu-item pure-u-1 pure-u-md-1-2 pure-u-lg-1-3">
				<a class=pure-menu-link href="{pattern.url}">
					<span class=siteswap>{pattern.notation}</span>
					<span class=name>{pattern.name}</span>
				</a>
			</li>
		{/each}
	{:else}
		<div class="pure-u-1 pure-u-md-1-1 pure-u-lg-1-1">
			<p>No pattern found for "{filter}"</p>
		</div>
	{/if}
</ul>
</div>

<h2>Extended siteswaps</h2>
<div class=pure-menu>
<ul class="pure-menu-list pure-g">
	{#if extendedSiteswaps.length}
		{#each extendedSiteswaps as pattern}
			<li class="pure-menu-item pure-u-1 pure-u-md-1-2 pure-u-lg-1-3">
				<a class=pure-menu-link href="{pattern.url}">
					<span class=siteswap>{pattern.notation}</span>
					<span class=name>{pattern.name}</span>
				</a>
			</li>
		{/each}
	{:else}
		<div class="pure-u-1 pure-u-md-1-1 pure-u-lg-1-1">
			<p>No pattern found for "{filter}"</p>
		</div>
	{/if}
</ul>
</div>
