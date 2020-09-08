
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

function loadFavorites()
{
	console.log('load', localStorage.getItem('favorites'));
	let list = JSON.parse(localStorage.getItem('favorites'));
	if (!list)
		list = [];
	const favorites = {};
	for (const fav of list)
		favorites[fav] = true;
	return favorites;
}

function saveFavorites(favorites)
{
	console.log('favorites', favorites);
	const list = [];
	// TODO: sort order??
	for (const [fav, dummy] of Object.entries(favorites))
		list.push(fav)
	console.log('save', JSON.stringify(list));
	localStorage.setItem('favorites', JSON.stringify(list));
}

export { defaults, useLocalStorage, siteswapUrl, loadFavorites, saveFavorites };
