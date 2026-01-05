<script>
	import { appName, appShortDescription } from '$lib/passist.mjs';
	import { patterns } from '$lib/patterns.mjs';
	const randomPatternUrl = patterns[Math.floor(Math.random() * patterns.length)].url;
</script>

<style>
	.page  { text-align:center }
	.description { display:inline-block; max-width:30em; text-align:justify; margin:0 1em }
	.meeseeks img { height:8rem; }
	.cube img     { width:10rem; }
	.cube  { margin-bottom:2em }
	.new { margin-top:3em }
</style>


<svelte:head>
	<title>{appName} - {appShortDescription}</title>
</svelte:head>

<div class=page>
	<h1>{appName}</h1>
	<p class=meeseeks>
		<img src="/images/mr_meeseeks_proud2.png" alt="mr meeseeks" />
	</p>
	<div class=description>
		This is the <b>passing siteswap assistant</b> helping you to find, start and animate passing patterns.
		It's currently based around siteswaps. Hopefully it will support a much wider pattern variety one day.
		Solo siteswaps are supported as well by changing the number of jugglers to one.
		Have fun!
	</div>
	<p class=cube>
		<img src="/images/cube.svg" alt="logo" />
	</p>
	<p>
		<a class=pure-button href="{randomPatternUrl}">Random Pattern</a>
	</p>
	<p class=new>
		New: <a href='/extended-siteswap/'>Extended Siteswap (beta)</a>
	</p>
</div>
