<script>
	import { jifdev } from '../components/passist.js';
	import { page } from '$app/stores';

	let segment = '';
	$: segment = '/' + $page.path.split('/')[1];

	let pages = [
		{ path:'/generator', title:'Generator' },
		{ path:'/siteswap',  title:'Siteswap' },
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
		{#each pages as page}
		<li class=pure-menu-item class:pure-menu-selected={segment === page.path || !segment && page.path === 'generator'}>
			<a
				class=pure-menu-link
				sveltekit:prefetch
				class:selected={segment === page.path || !segment && page.path === 'generator' }
				href={page.path}
			>
				{page.title}
			</a>
		</li>
		{/each}
	</ul>
</nav>
