<script>
	import { jifdev } from '$lib/passist.mjs';
	import { page } from '$app/stores';

	let segment = '';
	$: {
		const pathname = $page?.url?.pathname || '';
		segment = '/' + pathname.split('/')[1];
	}

	let pages = [
		{ path:'/siteswap-generator', title:'Generator' },
		{ path:'/siteswap',  title:'Siteswap' },
		{ path:'/extended-siteswap',  title:'Extended siteswap' },
		{ path:'/patterns',  title:'Patterns' },
		jifdev ? { path:'/jif',       title:'Jif' } : null,
		{ path:'/about',     title:'About' },
	].filter(Boolean);

</script>

<style>
	.pure-menu-selected, .pure-menu-link:focus { background:#fff }
	.pure-menu-link { color:#212529 }
	nav { position:absolute; bottom: 0; overflow-x:auto }
	@media (max-width:30em) {
		.pure-menu-link { padding: .5em .5em }
	}
</style>

<nav class="pure-menu pure-menu-horizontal">
	<ul class=pure-menu-list>
		{#each pages as p}
		<li class=pure-menu-item class:pure-menu-selected={segment === p.path || !segment && p.path === 'generator'}>
			<a
				class=pure-menu-link
				sveltekit:prefetch
				class:selected={segment === p.path || !segment && p.path === 'generator' }
				href={p.path}
			>
				{p.title}
			</a>
		</li>
		{/each}
	</ul>
</nav>
