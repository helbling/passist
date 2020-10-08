
const defaults = {
	siteswap: '86277',
	nJugglers: 2,
	propType: 'club',
};
const useLocalStorage = process.browser === true && 'localStorage' in window;

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
		jugglers: p.nJugglers,
	};
	if (p.fullscreen)
		query.fullscreen = 1;
	const url = U('/siteswap/' + p.siteswapInput, query);
	return url;
}

export { defaults, useLocalStorage, siteswapUrl };
