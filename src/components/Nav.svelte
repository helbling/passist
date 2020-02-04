<script>
	export let segment;

	let pages = [
		{ path:'generator', title:'Generator' },
		{ path:'siteswap',  title:'Siteswap' },
		{ path:'patterns',  title:'Patterns' },
		{ path:'animation', title:'Animation' },
		{ path:'about',     title:'About' },
	];
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}
	li {
		display: block;
		float: left;
	}
	.selected {
		position: relative;
		display: inline-block;
	}
	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}
	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		{#each pages as page}
		<li>
			<a
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
