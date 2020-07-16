
const defaults = {
	siteswap: "86277",
	nJugglers: 2,
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
		nJugglers: p.nJugglers,
	};
	if (p.fullscreen)
		query.fullscreen = 1;
	const url = U('/siteswap/' + p.siteswapInput, query);
	return url;
}

export { defaults, siteswapUrl };
