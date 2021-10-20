<script>
	import { useLocalStorage } from '$lib/passist.mjs';
	import Icon from '$lib/Icon.svelte';

	let jifInput = '{}';
	let jifOutput = '{}';
	let jif;
	let fileinput;
	let error = '';
	let savelink;

	let name;

	$:name = jif?.meta?.name || "";

	if (useLocalStorage)
		jifInput = localStorage.getItem('editor/jif', null);

	function load() {
		fileinput.click();
	}
	const onFileSelected =(e) => {
		const file = e.target.files[0];
		if (!file)
			return;
		const reader = new FileReader();
		reader.onload = e => {
			jifInput = e.target.result
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

	$: try {
		jif = jifInput ? JSON.parse(jifInput) : {};
		error = '';
	} catch (e) {
		error = 'Failed to parse JSON: ' + e;
	}

	$: {
		if (jif && !error) {
			jifOutput = JSON.stringify(jif, undefined, 2);
			if (useLocalStorage)
				localStorage.setItem('editor/jif', jifOutput);
		}
	}
</script>

<style>
.save:hover { text-decoration: none }
</style>

<h1>Editor</h1>
<input style="display:none" type="file" on:change={onFileSelected} bind:this={fileinput} >
<button class="load pure-button" on:click={load}>
	<Icon type=load /> load
</button>
<a bind:this={savelink} class="save pure-button" download={(jif?.meta?.name || "pattern").replaceAll(/\W+/g, "_") + ".jif"} on:click={save}>
	<Icon type=save /> save
</a>

{#if error}
	<div>
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see invalid input" >
		<p>{error}</p>
	</div>
{:else}
	<h3>Meta</h3>
	name: <input type=text value={jif?.meta?.name || ""} on:keyup={(e) => { jif.meta.name = e.target.value } } />
	<pre>
	{jifOutput}
	</pre>
{/if}

