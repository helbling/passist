<script>
	import { useLocalStorage } from '$lib/passist.mjs';
	import { page } from '$app/stores';

	let pathname = '';
	$: {
		pathname = $page?.url?.pathname || '';
		if (useLocalStorage && pathname != '/pattern')
			localStorage.setItem("last-pattern-page", pathname)
	}

	const pages = [
		{ path:'/siteswap',           title:'Global' },
		{ path:'/symmetric-siteswap', title:'Symmetric', longtitle:'Symmetric (beta)' },
		{ path:'/extended-siteswap',  title:'Extended',  longtitle:'Extended (beta)' },
		{ path:'/pattern/notation',   title:'Notation' },
		// { path:'/social-siteswap',   title:'Social Siteswap' }, // same as symmetric?
	];
</script>

<style>
	nav { margin-top:-1em; margin-bottom:1em; border-bottom:1px solid lightgray; overflow-x:auto }
	.pure-menu-selected, .pure-menu-link:focus { font-weight:bold }
	.pure-menu-link { color:#212529 }
	@media (max-width:34em) {
		.pure-menu-link { padding: .5em .5em }
	}
	@media (max-width:34em) {
		.longtitle { display:none }
	}
	@media (min-width:34em) {
		.shorttitle { display:none }
	}
</style>

<nav class="pure-menu pure-menu-horizontal" data-sveltekit-preload-data="hover">
	<ul class=pure-menu-list>
		{#each pages as p}
		<li class=pure-menu-item class:pure-menu-selected={pathname.startsWith(p.path)}>
			<a
				class=pure-menu-link
				href={p.path}
			>
				<span class=shorttitle>
					{p.title}
				</span>
				<span class=longtitle>
					{p.longtitle || p.title}
				</span>
			</a>
		</li>
		{/each}
	</ul>
</nav>

<slot/>
