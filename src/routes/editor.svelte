<script>
import EditorPage from '$lib/EditorPage.svelte';
import {jifdev } from '$lib/passist.mjs';
</script>

<svelte:head>
	<title>passist - Editor</title>
</svelte:head>

{#if jifdev}
	<EditorPage></EditorPage>
{:else}
	work in progress..
{/if}
