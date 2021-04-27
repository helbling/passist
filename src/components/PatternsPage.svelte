<script>
	import { knownSiteswaps } from '$lib/patterns.mjs';
</script>

<style>
	li { text-overflow:ellipsis; overflow:hidden }
	li .siteswap { width:5.5em; vertical-align:top; overflow:hidden; text-overflow:ellipsis }
	span { display:inline-block; color:#212529 }
</style>
<h2>Well-known siteswaps</h2>

<p><small>© Christian Kästner, <a href='https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt'>named-siteswaps.txt</a></p>

<div class=pure-menu>
<ul class="pure-menu-list pure-g">
	{#each knownSiteswaps as s}
		<li class="pure-menu-item pure-u-1 pure-u-md-1-2 pure-u-lg-1-3">
			<a class=pure-menu-link href="/siteswap/{s[0]}?jugglers=2">
				<span class=siteswap>{s[0]}</span>
				<span class=name>{s[1]}</span>
			</a>
		</li>
	{/each}
</ul>
</div>
