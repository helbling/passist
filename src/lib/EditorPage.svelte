<script>
	import { useLocalStorage } from '$lib/passist.mjs';
	import Icon from '$lib/Icon.svelte';
	import JifEditor from '$lib/JifEditor.svelte';
	import schema from '../../static/jif.schema.json';
	import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import { browser } from '$app/environment';

	let jifOutput = '{}';
	let jif = {};
	let fileinput;
	let error = '';
	let savelink;

	let name;
	let windowWidth;
	let windowHeight;
	let showAnimationWidget = false;

	$:name = (jif && jif.meta && jif.meta.name) || "";

	if (useLocalStorage)
		load(localStorage.getItem('editor/jif', null));

	function loadFile() {
		fileinput.click();
	}
	const onFileSelected =(e) => {
		const file = e.target.files[0];
		if (!file)
			return;
		const reader = new FileReader();
		reader.onload = e => {
			load(e.target.result);
		};
		reader.readAsText(file);
	};

	function save() {
		if (!jif)
			return;
		var data = new Blob([jifOutput], {type: 'application/jif+json'});
		var url = window.URL.createObjectURL(data);
		savelink.href = url;
	}

	function load(jifInput) {
		 try {
			jif = jifInput ? JSON.parse(jifInput) : {};
			error = '';
		} catch (e) {
			error = 'Failed to parse JSON: ' + e;
		}
	}

$: {
	if (!error) {
		jifOutput = JSON.stringify(jif, undefined, 2);
		if (useLocalStorage)
			localStorage.setItem('editor/jif', jifOutput);
	}
}

	if (browser === true)
		showAnimationWidget = useLocalStorage ? localStorage.getItem("showAnimationWidget") != "false" : true; // NOTE localStorage always saves strings
	$: useLocalStorage && localStorage.setItem("showAnimationWidget", showAnimationWidget ? "true" : "false");
</script>

<style>
.save:hover { text-decoration: none }
/*.causalDiagram { overflow-x:auto; margin-bottom:1em }*/
</style>

<h1>Editor - work in progress..</h1>
<input style="display:none" type="file" on:change={onFileSelected} bind:this={fileinput} >

<p>
	<button class="load pure-button" on:click={loadFile}>
		<Icon type=load /> load
	</button>
	<a
		href="/editor"
		bind:this={savelink}
		class="save pure-button"
		download={(name || "pattern").trim().replaceAll(/\W+/g, "_") + ".jif"}
		on:click={save}
	>
		<Icon type=save /> save
	</a>
</p>

{#if error}
	<div>
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see invalid input" >
		<p>{error}</p>
	</div>
{:else if jif}
	{#if jif}
		<JifEditor bind:content={jif} schema={schema} />
	{/if}

	<!-- NOT ready for general jif input :(
	<div class=causalDiagram>
		<CausalDiagramWidget
			{jif}
		/>
	</div>
	-->

	{#if showAnimationWidget}
	<div class=animation-wrapper style="width:{windowWidth > 1000 ? 1000 : windowWidth - 32}px; height:300px">
		<AnimationWidget
			{jif}
			closeButton={true}
			enableSettings={true}
			on:close={e => {showAnimationWidget = false;}}
		/>
	</div>
	{:else}
		<button class="pure-button" on:click={e => {showAnimationWidget = true;}}>Show Animation</button>
	{/if}

	<pre>
	{jifOutput}
	</pre>

{/if}

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />
