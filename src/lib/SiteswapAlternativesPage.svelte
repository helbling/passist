<script>
	import InputField from '$lib/InputField.svelte';
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import { defaults, jugglerName } from '$lib/passist.mjs';
	export let siteswapInput = "";
	export let nProps = defaults.nProps;
	export let nJugglers = defaults.nJugglers;
	export let minThrow = defaults.minThrow;
	export let maxThrow = defaults.maxThrow;
	export let include  = '';
	export let exclude  = '';

	let siteswap;
	let strippedInput;
	let siteswapValid = false;
	let cloze;

	function onSiteswapChange() {
		strippedInput = String(siteswapInput).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
		siteswap = new Siteswap(strippedInput);
		nProps = siteswap.nProps;
		cloze = new Siteswap(siteswap.heights); // clone
		if (nJugglers > 0) {
			siteswapValid = siteswap.isValid();
		} else {
			siteswapValid = false;
		}
	}

$:  onSiteswapChange(siteswapInput);

	const spinner = "⣷⣯⣟⡿⢿⣻⣽⣾";

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
		if (!siteswapValid)
			return;

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
		if (browser === true) {
			onchanged({
				nProps,
				minThrow,
				maxThrow,
				nJugglers,
				include,
				exclude,
				cloze,
			});
		}
	}
</script>

<style>
	.cloze-input { margin-bottom:1em }
	.cloze-input button + button { margin-left: 0.2em }
	.cloze-input button { font-weight:bold; box-shadow:none; -webkit-box-shadow:none; color:black }
	.cloze-input .gap { color:darkgray; border-bottom:2px solid black }
	.bold { font-weight:bold; color:black }
</style>


<div class="pure-form form-inline">
	<SiteswapInput
		bind:siteswapInput
		bind:nJugglers
		bind:siteswapValid
		idPrefix=animation
		showHandOrderInput={false}
	/>
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


{#if siteswapValid}
	<div class=cloze-input>
		{#each Object.entries(siteswap.heights) as [i, h]}
			<button
				class="pure-button"
				class:gap={cloze.heights[i] < 0}
				on:click={(e) => {
					cloze.heights[i] = cloze.heights[i] < 0 ? siteswap.heights[i] : -1;
				}}
			>
				{Siteswap.heightToChar(h)}
			</button>
		{/each}
	</div>
	{#if nJugglers >= 2 && siteswap.period % nJugglers == 0}
		<div class="pure-button-group" role="group">
			{#each Array.from(Array(+nJugglers).keys()) as i}
				<button
					class="pure-button"
					on:click={(e) => {
						cloze = new Siteswap(siteswap.heights.map((v, k) => (k % nJugglers == i ? -1 : v) ));
					}}
				>
					Alternatives for {jugglerName(i)}
				</button> <!-- NOCOMMIT TODO -->
			{/each}
		</div>
	{/if}

	<h5>{list.length} siteswaps found{ calculating ? ' so far ' + spinner.charAt(ticks % 8) : ' in ' + calctime  + 's'}</h5>

	{#if list.length}
		<div class=pure-menu>
			<ul class="pure-menu-list pure-g">
				{#each list as s}
					<li class="pure-menu-item pure-u-1 pure-u-sm-1-2 pure-u-md-1-4 pure-u-lg-1-6">
						<a class=pure-menu-link href="/siteswap/{s}?jugglers={nJugglers}">
							<span class=siteswap>
								{#each s as c, i}
									<span class:bold={cloze.heights[i] < 0}>{c}</span>
								{/each}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{:else if !calculating}
		<div>
			<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
		</div>
	{/if}

{:else}
	<div>
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
		<p>Invalid Siteswap</p>
	</div>
{/if}
