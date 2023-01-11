<script>
	import { appName, appShortDescription } from '$lib/passist.mjs';
	import { patterns } from '$lib/patterns.mjs';
	const randomPatternUrl = patterns[Math.floor(Math.random() * patterns.length)].url;
</script>

<style>
	h2 { font-size:1.25rem}
	.page  { text-align:center }
	.title { display:inline-block; text-align:left }
	.meeseeks img { height:8rem; }
	.cube img     { width:10rem; }
	.cube  { margin-bottom:2em }
</style>


<svelte:head>
	<title>{appName} - {appShortDescription}</title>
</svelte:head>

<div class=page>
	<p class=meeseeks>
		<img src="/images/mr_meeseeks_proud2.png" alt="mr meeseeks" />
	</p>
	<div class=title>
		<h1>{appName}</h1>
		<h2>{appShortDescription}</h2>
	</div>
	<p class=cube>
		<img src="/images/cube.svg" alt="logo" />
	</p>
	<p>
		<a class=pure-button href="{randomPatternUrl}">Random Pattern</a>
	</p>
</div>
