<script>
	import NavigationWidget from '../components/NavigationWidget.svelte';
	import { servertype } from '$lib/passist.mjs';

	export let segment;
</script>

<style>
	:global(body) {
		overflow: -moz-scrollbars-vertical;
		overflow-y: scroll;
	}

	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 1ex;
		margin: 0 auto;
		box-sizing: border-box;
	}

	header { background-color:#19a2ba; margin-bottom:0.5rem; padding:1rem 1rem 0 }
	header .container { display:flex; flex-wrap:wrap; margin:auto; padding-bottom:3em; position:relative }

	@media (min-width:1200px){ header .container{max-width:1140px} }
	@media (max-width:35.5em) {
		header .meeseeks { display:none }
	}
	@media (max-width:30em) {
		header { padding:.5rem .5rem 0 }
	}
	header .cube     { height:5.5rem; position:absolute }
	header .meeseeks { height:6rem; position:absolute; right:2em }
	header h1, header h2 { padding-left:6.5rem }
	header h2 { font-size:1.25rem}

	main {max-width:none !important }
	@media (min-width:1200px){main{max-width:1140px !important}}
</style>

<header>
	<div class="container">
		<div >
			<img class="cube" src="/images/cube.svg" alt="logo" />
		</div>
		<div style="flex:1">
			<h1>passist{servertype ? ' ' + servertype : ''}</h1>
			<h2>passing siteswap assistant</h2>
		</div>
		<div>
			<img class="meeseeks" src="/images/mr_meeseeks_proud2.png" alt="mr meeseeks" />
		</div>
		<NavigationWidget {segment}/>
	</div>
</header>
<main>
	<slot></slot>
</main>
