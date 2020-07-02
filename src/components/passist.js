
const defaults = {
	siteswap: "86277",
	n_jugglers: 2,
};

function siteswapUrl(p)
{
	let res = new URL('/siteswap/' + p.siteswap_input, location.href);
	res.searchParams.append('n_jugglers', p.n_jugglers);
	if (p.fullscreen)
		res.searchParams.append('fullscreen', 1);
	return res.href;
}

export { defaults, siteswapUrl };
