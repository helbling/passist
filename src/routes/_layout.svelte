<script>
	import NavigationWidget from '../components/NavigationWidget.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 1ex;
		margin: 0 auto;
		box-sizing: border-box;
	}

	header { background-color:#19a2ba; margin-bottom:0; padding:2rem 1rem }
	header .container { display:flex; flex-wrap:wrap; margin:auto }

	@media (min-width:1200px){ header .container{max-width:1140px} }
	@media (max-width:40em) {
		header .meeseeks { display:none }
	}
	header .cube, header .meeseeks { height:8rem; margin-top:-1em }
	header .cube { position:absolute }
	header h1, header h5 { padding-left:9rem }

	main {max-width:none !important }
	@media (min-width:1200px){main{max-width:1140px !important}}
</style>


<header>
	<div class="container">
		<div >
			<img class="cube" src="images/cube.svg" alt="logo" />
		</div>
		<div style="flex:1">
			<h1>passist beta</h1>
			<h5>passing siteswap assistant</h5>
		</div>
		<div>
			<img class="meeseeks" src="images/mr_meeseeks_proud2.png" alt="mr meeseeks" />
		</div>
	</div>
</header>

<NavigationWidget {segment}/>

<main>
	<slot></slot>
</main>
