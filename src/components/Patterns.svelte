<script>
	import { known_siteswaps } from './patterns.js';
</script>

<style>
	ul{ padding-left:0; column-width:20em }
	li { list-style-type:none }
	li .siteswap { display:inline-block; width:5.5em ; vertical-align:top}
	li .name { display:inline-block; text-overflow:ellipsis; width:15em }
</style>
<h1>Well-known siteswaps</h1>

<p><small>© Christian Kästner, <a href='https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt'>named-siteswaps.txt</a></p>

<ul>
	{#each known_siteswaps as s}
		<li>
			<a href="/siteswap/{s[0]}?n_jugglers=2">
				{s[1]}
			</a>
		</li>
	{/each}
</ul>
