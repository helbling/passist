<script>
	import { jifdev, appName } from '$lib/passist.mjs';
	import { page } from '$app/stores';

	let segment = '';
	$: {
		const pathname = $page?.url?.pathname || '';
		segment = '/' + pathname.split('/')[1];
		if (segment == '/siteswap' || segment == '/extended-siteswap')
			segment = '/pattern';
	}

	let pages = [
		{ path:'/',                   title:'Home' },
		{ path:'/siteswap-generator', title:'Generator' },
		{ path:'/pattern',            title:'Pattern' },
		{ path:'/library',            title:'Library' },
		jifdev ? { path:'/jif',       title:'Jif' } : null,
		{ path:'/about',              title:'About' },
	].filter(Boolean);

</script>

<style>
	:root {
		--main-bg-color: #fff /*#f5feff*/;
		--highlight-bg-color: #e9ecef /*#ddedf0*/;
		--button-bg-color: #e9ecef /*#e9eeef*/ ;
	}

	:global(body) {
		overflow: -moz-scrollbars-vertical;
		overflow-y: scroll;
		background-color: var(--main-bg-color);
	}

	main {
		position: relative;
		max-width: 56em;
		background-color: var(--main-bg-color);
		padding: 1ex;
		margin: 0 auto;
		box-sizing: border-box;
	}

	header { background-color:#19a2ba; margin-bottom:0.5rem; padding:0rem 1rem 0 }
	header .container { display:flex; flex-wrap:wrap; margin:auto; padding-bottom:3em; position:relative }

	@media (max-width:34em) {
		header { padding-left:0 }
	}

	main {max-width:none !important }
	@media (min-width:1200px){
		main{max-width:1140px !important}
		header .container{max-width:1140px}
	}

	/* navigation */
	.pure-menu-selected, .pure-menu-link:focus {
		background-color: var(--main-bg-color);
	}
	.pure-menu-link {
		color:#212529;
		letter-spacing: normal;
	}
	:global(.pure-menu-active) > :global(.pure-menu-link), :global(.pure-menu-link:focus), :global(.pure-menu-link:hover) {
		background-color: var(--highlight-bg-color) !important;
	}
	:global(.pure-button) {
		background-color: var(--button-bg-color) !important;
		text-decoration: none !important;
	}

	nav { position:absolute; bottom: 0; overflow-x:auto }
	@media (max-width:38em) {
		.title { display:none }
	}
	@media (max-width:34em) {
		.pure-menu-link { padding: .5em .5em }
	}
	img.cube { width:24px; height:24px; margin:-6px 0}
</style>

<svelte:head>
	<meta name="theme-color" content="#19a2ba">
	<link rel='stylesheet' href='/pure-2.0.3-min.css'>
	<link rel='stylesheet' href='/pure-2.0.3-grids-responsive-min.css'>
	<link rel='stylesheet' href='/global2.css'>
	<link rel='manifest' href='/manifest.json'>
	<link rel="shortcut icon" href="/favicon.ico">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href="/images/icon-192x192.png">
	<meta http-equiv="Language" content="en">
	<meta http-equiv="description" content="siteswap generator, find start configurations, causal diagram, patterns">
</svelte:head>

<header>
	<div class="container">
		<nav class="pure-menu pure-menu-horizontal" data-sveltekit-preload-data="hover">
			<ul class=pure-menu-list>
				{#each pages as p}
				<li class=pure-menu-item class:pure-menu-selected={segment === p.path}>
					<a
						class=pure-menu-link
						class:selected={segment === p.path }
						href={p.path}
					>
						{#if p.path == '/'}
							<img class="cube" src="/images/cube.svg" alt="Home" title="Home">
							<span class="title">{appName}</span>
						{:else}
							{p.title}
						{/if}
					</a>
				</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>
<main>
	<slot></slot>
</main>
