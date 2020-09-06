<script>
	import InputField from './InputField.svelte';
	import Siteswap from './siteswap.js';
	import { onMount, onDestroy } from 'svelte';

	export let nProps = 7;
	export let period = 5;
	export let minThrow = 2;
	export let maxThrow = 10;
	export let include = '';
	export let exclude = '3 5';

	const spinner = "⣷⣯⣟⡿⢿⣻⣽⣾";

// TODO: limit parameters
//	nProps = Math.max(0, Math.min(35, parseInt(nProps)));
//	period = Math.max(1, Math.min(15, parseInt(period)));
//	minThrow = Math.max(0, Math.min(35, parseInt(minThrow)));
//	maxThrow = Math.max(0, Math.min(35, parseInt(maxThrow)));
//	nJugglers = Math.max(1, Math.min(9, parseInt(nJugglers)));

	export let nJugglers = 2;

	let list = [];
	let calculating = true;
	let calctime = 0;
	let ticks = 0;
	let generatorInterval;
	let timer;
	onMount(() => {
		timer = setInterval(() => {
			ticks += 1;
			if (calculating && (ticks % 10 == 0)) {
				list = list;
			}
		}, 100);
	});
	onDestroy(() => {
		clearInterval(timer);
		clearInterval(generatorInterval);
	});
	const onchanged = (params) => {
		ticks = 0;
		calculating = true;
		list = [];
		clearInterval(generatorInterval);
		let generator = Siteswap.generate(params)
		generatorInterval = setInterval(() => {
			while (true) {
				const next = generator.next();
				if (next.done) {
					calctime = ticks / 10;
					clearInterval(generatorInterval);
					generatorInterval = undefined;
					calculating = false;
					list = list;
					return;
				} else if (next.value !== undefined) {
						list.push(next.value);
				} else {
					return;
				}
			}
		}, 0);
	};

	$: {
		if (process.browser === true) {
			onchanged({
				nProps:    nProps,
				period:    period,
				minThrow:  minThrow,
				maxThrow:  maxThrow,
				include:   include,
				exclude:   exclude,
				nJugglers: nJugglers
			});
		}
	}

</script>

<style>
	ul { list-style-type:none; column-width:8em }
	span.siteswap { color: #212529 }
</style>

<div class="pure-form form-inline">

	<InputField
		bind:value={nProps}
		type=number
		id=nProps
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
		bind:value={maxThrow}
		type=number
		id=maxThrow
		label="Max throw"
		min=1
		max=35
	/>

	<InputField
		bind:value={minThrow}
		type=number
		id=minThrow
		label="Min throw"
		min=0
		max=35
	/>

	<InputField
		bind:value={nJugglers}
		type=number
		id=nJugglers
		label='👥'
		title="Number of jugglers"
		min=1
		max=9
	/>

	<InputField
		bind:value={include}
		type=search
		id=include
		label='Include global'
		placeholder='e.g. 2 8'
	/>

	<InputField
		bind:value={exclude}
		type=search
		id=exclude
		label='Exclude global'
	/>
</div>

<h5>{list.length} siteswaps found{ calculating ? ' so far ' + spinner.charAt(ticks % 8) : ' in ' + calctime  + 's'}</h5>

{#if list.length}
	<div class=pure-menu>
		<ul class="pure-menu-list pure-g">
			{#each list as s}
				<li class="pure-menu-item pure-u-1 pure-u-sm-1-2 pure-u-md-1-4 pure-u-lg-1-6">
					<a class=pure-menu-link href="./siteswap/{s}?nJugglers={nJugglers}"><span class=siteswap>{s}</span></a>
				</li>
			{/each}
		</ul>
	</div>
{:else if !calculating}
	<div>
		<img src=images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
	</div>
{/if}
