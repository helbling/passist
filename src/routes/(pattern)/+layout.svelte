<script>
	import { page } from '$app/stores';

	let segment = '';
	$: {
		const pathname = $page?.url?.pathname || '';
		segment = '/' + pathname.split('/')[1];
	}

	// TODO: sticky subnavigation? would need notation to have its own page..
	const pages = [
		{ path:'/pattern',          title:'Notation' },
		{ path:'/siteswap',         title:'Global Siteswap' },
		{ path:'/extended-siteswap', title:'Extended Siteswap' },
		// { path:'/social-siteswap',   title:'Social Siteswap' },
		// { path:'/prechac',           title:'Prechac' },
	];
</script>

<style>
	nav { margin-top:-1em; margin-bottom:1em; border-bottom:1px solid lightgray }
	.pure-menu-selected, .pure-menu-link:focus { font-weight:bold }
	.pure-menu-link { color:#212529 }
	@media (max-width:30em) {
		.pure-menu-link { padding: .5em .5em }
	}
</style>

<nav class="pure-menu pure-menu-horizontal" data-sveltekit-preload-data="hover">
	<ul class=pure-menu-list>
		{#each pages as p}
		<li class=pure-menu-item class:pure-menu-selected={segment === p.path}>
			<a
				class=pure-menu-link
				class:selected={segment === p.path}
				href={p.path}
			>
				{p.title}
			</a>
		</li>
		{/each}
	</ul>
</nav>

<slot/>
