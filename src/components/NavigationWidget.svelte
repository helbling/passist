<script>
	export let segment;

	let pages = [
		{ path:'generator', title:'Generator' },
		{ path:'siteswap',  title:'Siteswap' },
		{ path:'patterns',  title:'Patterns' },
		{ path:'about',     title:'About' },
	];
</script>

<style>
	.pure-menu-selected { background:#fff }
	.pure-menu-link { color:#212529 }
</style>

<nav class="pure-menu pure-menu-horizontal">
	<ul class=pure-menu-list>
		{#each pages as page}
		<li class=pure-menu-item class:pure-menu-selected={segment === page.path || !segment && page.path === 'generator'}>
			<a
				class=pure-menu-link
				rel=prefetch
				class:selected={segment === page.path || !segment && page.path === 'generator' }
				href={page.path}
			>
				{page.title}
			</a>
		</li>
		{/each}
	</ul>
</nav>
