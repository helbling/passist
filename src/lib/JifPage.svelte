<script>
	import { onMount } from 'svelte';
	import { useLocalStorage } from '$lib/passist.mjs';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	/*
	TODO import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	 */

	let jif;
	let jsonValid = true;
	let jifString = '{}';

	if (useLocalStorage)
		jifString = localStorage.getItem('jif', null);

	$: {
		try {
			jif = JSON.parse(jifString);
			jsonValid = true;
			if (useLocalStorage)
				localStorage.setItem('jif', jifString);
		} catch (e) {
			jsonValid = false;
		}
	}
	onMount(async () => {
		console.log(jif);
	});
</script>

<style>
	.horizontal-split { display:grid; grid-template-columns: 50% 50%; }
	.left   { grid-column:1 }
	.right  { grid-column:2 }
	.input  { width:100%; height:30em }
	.invalid { color:#dc3545 }
</style>

<div class=horizontal-split>

<textarea class="left input" class:invalid={!jsonValid} bind:value={jifString}></textarea>

<div class="right" >
{#if jif}
	<AnimationWidget {jif} />
{/if}
</div>

</div>
