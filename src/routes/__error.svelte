<script context="module">
	export function load({ error, status }) {
		return {
			props: { error, status }
		};
	}
</script>

<script>
	export let status;
	export let error;
</script>

<style>
	h1, p { margin: 0 auto }
	h1 { font-size: 2.8em; font-weight: 700; margin: 0 0 0.5em 0 }
	p { margin: 1em auto }
	@media (min-width: 480px) { h1 { font-size: 4em } }
</style>

<svelte:head>
	<title>{status}</title>
</svelte:head>

<h1>{status}</h1>

<img src='/images/mr_meeseeks_shocked_small.png' alt='mr meeseeks is shocked to see no siteswaps' />

<p>{error.message}</p>

<!-- stack not visible in production, see https://kit.svelte.dev/docs#layouts-error-pages -->
{#if error.stack}
	<pre>{error.stack}</pre>
{/if}
