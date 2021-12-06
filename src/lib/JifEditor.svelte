<script>
import Icon from '$lib/Icon.svelte';

export let content;
export let schema;
export let path = '';

let type;
let newKey = '';
let edit = false;
let children = [];
let open = {};

$: type = schema && schema.type;

function preview(x) {
	if (x === undefined)
		return 'undefined';
	const json = JSON.stringify(x);
	if (json.length < 50)
		return json;

	if (Array.isArray(x))
		return 'Array(' + x.length + ')';

	if (typeof x === 'object')
		return '{..}';

}

$: {
	if (type == 'object')
		children = Object.entries(schema.properties || {});
	if (type == 'array')
		children = content.map((v, i) => [i, schema.items])

	children = children.map(([key, subschema]) => {
		return {
			key,
			subschema,
			foldable: ['object', 'array'].includes(subschema.type),
		};
	});
}

$: {
	if (type == 'object') {
		if (!content)
			content = {};
	} else if (type == 'array') {
		if (!content)
			content = [];
		newKey = content.length;
	}
}

function addKey(e) {
	if (type == 'object' && newKey && !content[newKey]) {
		content[newKey] = '';
		newKey = '';
	}
	if (type == 'array')
		content.push( 0 );

	content = content;
}

function deleteKey(type, key) {
	if (type == 'object')
		delete content[key];
	if (type == 'array')
		content.splice(key, 1);
	content = content;
}

</script>

<style>
	td { width: 1px  }
	td:last-child { width: 100% }
	input { width: 15em }
	input.key { width: 5em }
	.clickable { cursor:pointer }
</style>

{#if type == "string"}
	<input
		type=text
		bind:value={content}
	/>
{:else if type == "integer"}
	<input
		type=number
		step=1
		bind:value={content}
	/>
{:else if type == "number"}
	<input
		type=number
		step=any
		bind:value={content}
	/>
{:else if children}
	<table><tr><td>
				<!--
		<button
			class="pure-button"
			on:click={(e) => { edit = !edit }}
		>
			<Icon type=edit />
		</button>
		-->
	</td><td>
		<table>
			{#each children as { key, subschema, foldable } }
			<tr class:clickable={foldable} on:click={(e) => { if (foldable) { open[key] ^= 1; } }}>
				<td>
					{#if foldable}
						<Icon type={open[key] ? "caret-bottom" : "caret-right"} fill={true}/>
					{/if}
				</td>
				<td>
					{key}
				</td>
				<td>
					{#if !foldable}
						<svelte:self bind:content={content[key]} schema={subschema} path={path + '.' + key} />
					{:else if !open[key]}
						{preview(content[key])}
					{/if}
				</td>
			</tr>

			{#if foldable && open[key]}
			<tr>
				<td></td>
				<td colspan=2>
					<svelte:self bind:content={content[key]} schema={subschema} path={path + '.' + key} />
				</td>
			</tr>
			{/if}

			{/each}
			<tr>
				<td>
				</td>
				<td>
					{#if edit && type == 'object'}
					<input
						class=key
						type=text
						size=5
						placeholder=key
						bind:value={newKey}
					/>
					{/if}
				</td>
				<td>
					{#if edit}
					<button
						class="pure-button"
						class:pure-button-disabled={!newKey || content[newKey]}
						on:click={(e) => addKey(type)}
					>
						<Icon type=plus />
					</button>
					{/if}
				</td>
			</tr>
		</table>
	</td></tr></table>
{/if}
