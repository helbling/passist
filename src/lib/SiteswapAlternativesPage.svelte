<script>
	import InputField from '$lib/InputField.svelte';
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { defaults, jugglerName, siteswapUrl } from '$lib/passist.mjs';
	export let siteswapInput = "";
	export let nProps = defaults.nProps;
	export let nJugglers = defaults.nJugglers;
	export let minThrow = defaults.minThrow;
	export let maxThrow = defaults.maxThrow;
	export let include  = '';
	export let exclude  = '';
	export let handsInput  = '';

	let siteswap;
	let strippedInput;
	let siteswapValid = false;
	let cloze;
	let splittable = false;

	function onSiteswapChange() {
		strippedInput = String(siteswapInput).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
		siteswap = new Siteswap(strippedInput);
		nProps = siteswap.nProps;
		cloze = new Siteswap(siteswap.heights); // clone
		splittable = nJugglers >= 2 && siteswap.period % nJugglers == 0;

		if (nJugglers > 0) {
			siteswapValid = siteswap.isValid();
			if (splittable) {
				for (let i = 0; i < siteswap.period; i += nJugglers)
					cloze.heights[i] = -1;
			}
		} else {
			siteswapValid = false;
		}
	}

	function canonic(siteswap) {
		const period = siteswap.length;
		const shifts = [];
		for (let i = 0; i < period; i++)
			shifts.push(siteswap.slice(i) + siteswap.slice(0, i));
		return shifts.sort()[period - 1];
	}

	function splittedSiteswaps(siteswapString) {
		const localLength = siteswapString.length / nJugglers;
		const result = Array.from(Array(nJugglers), () => new Array(localLength));
		[...siteswapString].forEach((c, i) => {
			result[i % nJugglers][(Math.floor(i / nJugglers) * nJugglers) % localLength] = c;
		});
		return result.map((a) => canonic(a.join('')));
	}

$:  onSiteswapChange(siteswapInput, nJugglers);

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
	.cloze-input button + button, .cloze-shortcuts button + button { margin-left: 0.2em }
	.cloze-input button { font-weight:bold; box-shadow:none; -webkit-box-shadow:none; color:black }
	button:focus { background-image:none }
	.cloze-input .gap { color:darkgray; border-bottom:2px solid black }
	.cloze-shortcuts { margin-bottom:1em }
	.bold { font-weight:bold; color:black }
</style>

<h2>Siteswap alternatives (beta)</h2>

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
	<h5>Throws to change</h5>
	{#if splittable}
		<div class="cloze-shortcuts pure-button-group" role="group">
			{#each Array.from(Array(+nJugglers).keys()) as i}
				<button
					class="pure-button"
					class:pure-button-active={cloze.heights.every((v, k) => (v < 0) == (k % nJugglers == i))}
					on:click={(e) => {
						cloze = new Siteswap(siteswap.heights.map((v, k) => (k % nJugglers == i ? -1 : v) ));
					}}
				>
					Juggler {jugglerName(i)}
				</button>
			{/each}
		</div>
	{/if}

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


	{#if !cloze.heights.filter((v) => v < 0).length}
		Please choose some throws to change with the buttons above.
	{:else}
		<h5>{list.length} siteswaps found{ calculating ? ' so far ' + spinner.charAt(ticks % 8) : ' in ' + calctime  + 's'}</h5>
		{#if list.length}
			<div class=pure-menu>
				<ul class="pure-menu-list pure-g">
					{#each list as s}
						<li class="pure-menu-item pure-u-1 pure-u-lg-1-2">
							<a class=pure-menu-link href={siteswapUrl({siteswapInput:s, nJugglers, handsInput})}>
								<span class=siteswap>
									{#each s as c, i}
										<span class:bold={cloze.heights[i] < 0}>{c}</span>
									{/each}
								</span>
							</a>
							{#if splittable}
								<ul class="pure-menu-list pure-g">
								{#each splittedSiteswaps(s) as splittedSiteswap, jugglerIndex}
									<li class="pure-menu-item pure-u-lg-1-3">
										<a
											class="pure-menu-link"
											href={siteswapUrl({siteswapInput:splittedSiteswap, nJugglers, handsInput})}
										>
											{jugglerName(jugglerIndex)}: {splittedSiteswap}
										</a>
									</li>
								{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{:else if !calculating}
			<div>
				<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
			</div>
		{/if}
	{/if}

{:else}
	<div>
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
		<p>Invalid Siteswap</p>
	</div>
{/if}
