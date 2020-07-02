
const defaults = {
	siteswap: "86277",
	n_jugglers: 2,
};

function U(path, query)
{
	const queryPart = Object.entries(query).map(
		([key, val]) => `${key}=${encodeURIComponent(val)}`
	).join('&');
	return path + (queryPart ? '?' + queryPart : '');
}

function siteswapUrl(p)
{
	const query = {
		n_jugglers: p.n_jugglers,
	};
	if (p.fullscreen)
		query.fullscreen = 1;
	const url = U('/siteswap/' + p.siteswap_input, query);
	return url;
}

export { defaults, siteswapUrl };
