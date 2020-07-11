<script>
	import InputField from './InputField.svelte';
	import Siteswap from './siteswap.js';

	export let n_objects = 7;
	export let period = 5;
	export let min_throw = 2;
	export let max_throw = 10;
	export let include = '';
	export let exclude = '3 5';

// TODO: limit parameters
//	n_objects = Math.max(0, Math.min(35, parseInt(n_objects)));
//	period = Math.max(1, Math.min(15, parseInt(period)));
//	min_throw = Math.max(0, Math.min(35, parseInt(min_throw)));
//	max_throw = Math.max(0, Math.min(35, parseInt(max_throw)));
//	n_jugglers = Math.max(1, Math.min(9, parseInt(n_jugglers)));

	export let n_jugglers = 2;

//$:	list = Siteswap.generate({ n_objects:  n_objects, period:     period, min_throw:  min_throw, max_throw:  max_throw, include:    include, exclude:    exclude, n_jugglers: n_jugglers, });

	let list = [];
	let params;
	let calculating = false;


$:  {
		calculating = true;
		params = {
			n_objects:  n_objects,
			period:     period,
			min_throw:  min_throw,
			max_throw:  max_throw,
			include:    include,
			exclude:    exclude,
			n_jugglers: n_jugglers
		};
		list = [];
		for (let s of Siteswap.generate(params))
			list.push(s);
		calculating = false;
	}

</script>

<style>
	ul { list-style-type:none; column-width:8em }
</style>

<div class=form-inline>

	<InputField
		bind:value={n_objects}
		type=number
		id=n_objects
		label=#Objects
		title="Number of objects"
		min=1
		max=35
	/>

	<InputField
		bind:value={period}
		type=number
		id=period
		label='Period'
		min=1
		max=15
	/>

	<InputField
		bind:value={max_throw}
		type=number
		id=max_throw
		label="Max throw"
		min=1
		max=35
	/>

	<InputField
		bind:value={min_throw}
		type=number
		id=min_throw
		label="min throw"
		min=0
		max=35
	/>

	<InputField
		bind:value={n_jugglers}
		type=number
		id=n_jugglers
		label='👥'
		title="Number of jugglers"
		min=1
		max=9
	/>

	<InputField
		bind:value={include}
		type=search
		id=include
		label='Include global {include}'
		placeholder='e.g. 2 8'
	/>

	<InputField
		bind:value={exclude}
		type=search
		id=exclude
		label='Exclude global {include}'
	/>
</div>

<h5>{list.length} siteswaps found{ calculating ? ' so far' : ''}</h5>

{#if list.length}
	<div class=scroll>
		<ul class="mt-4 list">
			{#each list as s}
				<li>
					<!-- TODO
					<span>generator timeout :(</span>
					-->
					<a href="./siteswap/{s}?n_jugglers=2"><span class=siteswap>{s}</span></a>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<div>
		<img src=images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
	</div>
{/if}
