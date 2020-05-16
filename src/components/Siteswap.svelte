<script>
	import SiteswapInput from './SiteswapInput.svelte';
	import CausalDiagram from './CausalDiagram.svelte';
	import Animation from './Animation.svelte';
	import Siteswap from './siteswap.js';
	import { siteswap_names} from './patterns.js';
	import { goto } from '@sapper/app';

	const use_local_storage = typeof window !== 'undefined' && 'localStorage' in window;

	 // server should return empty siteswap to avoid flashing some overwritten default
	export let siteswap_input = use_local_storage ? (localStorage.getItem("siteswap") || "86277") : "";
	export let n_jugglers = use_local_storage ? (localStorage.getItem("n_jugglers") || 2) : 2;
	export let fullscreen = false;

	$:	use_local_storage && siteswap_input && localStorage.setItem("siteswap", siteswap_input);
	$:	use_local_storage && localStorage.setItem("n_jugglers", n_jugglers);
	$:	use_local_storage && localStorage.setItem("jif", jif);

	let siteswap_shift = 0;
	let siteswap, stripped_input, original_siteswap;
	let valid = false;
	let period;
	let n_props;
	let siteswap_name;
	let start_properties;
	let local_period;
	let prechacthis_url;
	let start_configurations;
	let jif;
	let window_width;
	let window_height;

	function shift_left() {
		siteswap_shift = (siteswap_shift + 1) % period;
	}
	function shift_right() {
		siteswap_shift = (siteswap_shift + period - 1) % period;
	}
	function get_url(p = {}) {
		p = Object.assign({
			siteswap_input: siteswap_input,
			n_jugglers: n_jugglers,
			fullscreen: fullscreen,
		}, p);
		let res = new URL('/siteswap/' + p.siteswap_input, location.href);
		res.searchParams.append('n_jugglers', p.n_jugglers);
		if (p.fullscreen)
			res.searchParams.append('fullscreen', 1);
		return res.href;
	}
	function on_fullscreen_change(e) {
		const url = get_url({fullscreen: e.detail});
		goto(url);
	}

$:	{
		stripped_input = String(siteswap_input).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
		original_siteswap = new Siteswap(stripped_input);
		siteswap = original_siteswap.shift(siteswap_shift);
		if (n_jugglers > 0) {
			jif = siteswap.to_jif({n_jugglers: n_jugglers});
			valid = siteswap.is_valid();
			period = siteswap.period;
			n_props = siteswap.n_props;
			siteswap_name = siteswap_names[siteswap.canonic_string()];
			start_properties = siteswap.get_start_properties(n_jugglers);

			local_period = period % n_jugglers == 0 ? period / n_jugglers : period;

			start_configurations = siteswap.start_configurations(n_jugglers);

			prechacthis_url = 'http://prechacthis.org/info.php?pattern=['
		 + start_configurations[0].local.map(function(x) { var h = x.height / 2; return 'p(' + h + (+x.height & 1 ? ',1,' + (h + local_period / 2) : ',0,' + h) + ')';}).join(',')
		 + ']&persons=2';
		} else {
			valid = false;
		}
	}

	function prechac(x, n_jugglers) {
		return Math.round(+x / n_jugglers * 100) / 100;
	}

	function word(x) {
		var word = [
			'wait',
			1,
			'zip',
			3,
			'flip',
			'zap',
			'self',
			'single pass',
			'heff',
			'double pass',
			'triple self',
			'triple pass'
		][x];
		return word ? word : x;
	}


</script>

<style>
	.causal_diagram { overflow-x:auto; margin-bottom:1em }
	a.arrow { color:inherit; text-decoration:none }
</style>

<svelte:window bind:innerWidth={window_width} bind:innerHeight={window_height} />

<SiteswapInput
	bind:siteswap_input={siteswap_input}
	bind:n_jugglers={n_jugglers}
	bind:valid={valid}
	id_prefix=main_
/>

{#if valid || fullscreen}
	<h2>
		<!-- TODO: put correct siteswap shift in href -->
		<a class=arrow href='javascript:;' on:click={shift_left}>◄</a>
		{siteswap.to_string()}
		<a class=arrow href='javascript:;' on:click={shift_right}>►</a>

		{siteswap_name ? siteswap_name : ''}
	</h2>

	<p>
		{n_props} objects, period {period}, squeezes {start_properties.squeezes} {start_properties.is_ground_state ? ', ground_state' : ''}

		<!--
		{#if n_jugglers > 1}
		, interface: {siteswap.global_interface(n_jugglers)}
		{/if}
		-->
	</p>
	{#if n_jugglers > 1}
		<div class=local_throws>
			<table>
				<tr>
					<td>Local&nbsp;</td>
					<td colspan={local_period + 1}>Siteswap</td>
					<td colspan={local_period + 1}>
						{#if n_jugglers == 2}
							<a href={prechacthis_url}>Prechac</a>
						{:else}
							Prechac
						{/if}
					</td>

					{#if n_jugglers == 2}
						<td colspan={local_period}>Words</td>
					{/if}
				</tr>
				{#each start_configurations as j}
					<tr>
						<th>{j.name} <sub>{j.start_obj_left}|{j.start_obj_right}</sub></th>
						{#each j.local as t}
							<td>{t.siteswap}{@html t.desc}&nbsp;</td>
						{/each}
						<td class=px-3 />
						{#each j.local as t}
							<td>{prechac(t.height, n_jugglers)}{@html t.desc}</td>
						{/each}
						{#if n_jugglers == 2}
							<td class=px-3 />
							{#each j.local as t}
								<td>{word(t.height)},&nbsp;</td>
							{/each}
						{/if}
					</tr>

				{/each}
			</table>

		</div>
	{/if}

	<div class=causal_diagram>
		<CausalDiagram
			{jif}
			{start_configurations}
			steps={n_jugglers * period * 2}
		/>
	</div>

	<Animation
		{jif}
		{valid}
		width={window_width > 1000 ? 1000 : window_width - 32}
		height=300
		bind:fullscreen={fullscreen}
		on:fullscreen_change={on_fullscreen_change}
	>
		<SiteswapInput
			bind:siteswap_input={siteswap_input}
			bind:n_jugglers={n_jugglers}
			bind:valid={valid}
			id_prefix=animation_
		/>
	</Animation>

{:else if siteswap_input}
	<div>
		<img src=images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
		<p>Invalid Siteswap</p>
	</div>
{:else}
	<!-- empty string: no output -->
{/if}
