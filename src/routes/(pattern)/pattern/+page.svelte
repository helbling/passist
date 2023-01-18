<script>
import { appName, useLocalStorage } from '$lib/passist.mjs';
import { goto } from '$app/navigation';

if (useLocalStorage)
	goto(localStorage.getItem('last-pattern-page') ?? '/siteswap');

</script>

<svelte:head>
	<title>{appName} - Pattern</title>
</svelte:head>
