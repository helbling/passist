
const defaults = {
	siteswap: '86277',
	nJugglers: 2,
	propType: 'club',
	jugglingSpeed: 2.8,
	animationSpeed: 0.8,
};

const colors = {
	sky: '#24b59f',
	horizon: '#eff9b7',
	fog: '#ffffee',
	ground1: '#937a24',
	ground2: '#987d2e',
	meeseeks: '#5fcaf6',
	props: [
		'#c0392b', // red
		'#0c0d5d', // blue
		'#f45d20', // orange
		'#ed4694', // pink
		'#6f5499', // violet
		'#00dc3c', // green
		'#ffd700', // yellow
		'#f2f2f2', // white
	],
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

function jugglerName(i)
{
	return String.fromCharCode(65 + i);
}

function defaultHandOrder(n) {
	const result = [];
	for (let i = 0; i < 2 * n; i++) {
		const juggler = i % n;

		// alternating right and left for an odd number of jugglers makes the patterns more symmetric (Co Stuifbergen)
		const right = (n % 2) ? !(i % 2) : i < n;
		const rightLeft = right ? 'right' : 'left';
		result.push({
			juggler,
			type: rightLeft + ' hand',
			text: jugglerName(juggler) + ' ' + rightLeft,
			textShort: jugglerName(juggler) + (right ? 'ᵣ' : 'ₗ'),
		});
	}
	return result;
}

const servertype = {
	development:'dev',
	beta:'beta',
	alpha:'alpha'
}[process.env.NODE_ENV];

const jifdev = servertype == 'dev' || servertype == 'alpha';

export { defaults, colors, useLocalStorage, siteswapUrl, jugglerName, defaultHandOrder, servertype, jifdev };
