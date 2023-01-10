<script>
	import { servertype } from '$lib/passist.mjs';
</script>

<style>
	h2 { font-size:1.25rem}
	/*
	.cube     { height:5.5rem; }
	.meeseeks { height:6rem; }
	 */
</style>


<svelte:head>
	<title>passist - passing siteswap assistant</title>
</svelte:head>

<h1>passist{servertype ? ' ' + servertype : ''}</h1>
<h2>passing siteswap assistant</h2>

<!--
	<img class="cube" src="/images/cube.svg" alt="logo" />
	<img class="meeseeks" src="/images/mr_meeseeks_proud2.png" alt="mr meeseeks" />

	TODO: add some fancy content here!
	-->
