<script>
	import { onMount } from 'svelte';
	import { useLocalStorage, defaults } from '$lib/passist.mjs';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import InputField from '$lib/InputField.svelte';
	import Icon from '$lib/Icon.svelte';
	import Jif from '$lib/jif.mjs';

	/*
	TODO import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	 */

	let jif;
	let jsonValid = true;
	let jifString = '{}';
	let fileinput;
	let savelink;
	let name;
	let error = '';
	let warnings = [];
	let animationSpeed = defaults.animationSpeed;

	if (useLocalStorage)
		jifString = localStorage.getItem('jif', null);

	$: {
		try {
			warnings = [];
			error = '';

			// TODO: would a destructuring assignment work?
			const complete = Jif.complete(jifString, { expand:true });
			jif = complete.jif;
			warnings = complete.warnings;

			jsonValid = true;
			name = (jif && jif.meta && jif.meta.name) || "";
			if (useLocalStorage)
				localStorage.setItem('jif', jifString);
		} catch (e) {
			jsonValid = false;
			error = e.message;
		}
	}
	onMount(async () => {
		console.log(jif);
	});

	function loadFile() {
		fileinput.click();
	}
	const onFileSelected =(e) => {
		const file = e.target.files[0];
		if (!file)
			return;
		const reader = new FileReader();
		reader.onload = e => {
			jifString = e.target.result;
		};
		reader.readAsText(file);
	};

	function save() {
		if (!jif)
			return;
		var data = new Blob([jifString], {type: 'application/jif+json'});
		var url = window.URL.createObjectURL(data);
		savelink.href = url;
	}
</script>

<style>
	.horizontal-split { display:grid; grid-template-columns: 50% 50%; }
	.left   { grid-column:1 }
	.right  { grid-column:2 }
	.input  { width:100%; height:30em }
	.invalid { color:#dc3545 }
	.error   { color:red }
	.warnings { color:orange }
	.animation-controls { display:flex; flex-flow:row wrap }
</style>

<div class=horizontal-split>

<textarea class="left input" class:invalid={!jsonValid} bind:value={jifString}></textarea>

<div class="right" >
{#if jif}
	<AnimationWidget
		{jif}
		animationSpeed={parseFloat(animationSpeed)}
	/>
	<p class=animation-controls>
		<InputField
			bind:value={animationSpeed}
			type=range
			id=animationspeed
			label='Animation speed'
			step=0.1
			min=0.1
			max=2
			defaultValue={defaults.animationSpeed}
		/>
	</p>
{/if}
</div>

</div>
<p>
	<button class="load pure-button" on:click={loadFile}>
		<Icon type=load /> load
	</button>
	<a
		href="/jif"
		bind:this={savelink}
		class="save pure-button"
		download={(name || "pattern").trim().replaceAll(/\W+/g, "_") + ".jif"}
		on:click={save}
	>
		<Icon type=save /> save
	</a>
	<input style="display:none" type="file" on:change={onFileSelected} bind:this={fileinput} >
</p>

{#if error || warnings.length}
	<p class=error>{error}</p>
	{#if warnings.length}
	<ul class=warnings>
		{#each warnings as warning}
		<li>{warning}</li>
		{/each}
	</ul>
	{/if}
{/if}
