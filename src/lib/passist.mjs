import { browser, dev } from '$app/environment';

const defaults = {
	siteswap: '86277',
	nJugglers: 2,
	propType: 'club',
	jugglingSpeed: 2.8,
	animationSpeed: 0.8,
	siteswapGeneratorParams: {
		nProps: 7,
		period: 5,
		maxThrow: 10,
		minThrow: 2,
		nJugglers: 2,
		include: '',
		exclude: '3 5',
	},
};

const useLocalStorage = browser === true && 'localStorage' in window;

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
	if (p.handsInput)
		query.hands = p.handsInput.replace(/[^a-z]+/gi, '-');
	const url = U('/siteswap/' + ((typeof p.siteswapInput === 'string') ? p.siteswapInput.replace(/[^0-9a-zA-Z]+/g, '') : ''), query);
	return url;
}

function siteswapAlternativesUrl(p)
{
	return siteswapUrl(p).replace('/siteswap/', '/siteswap-alternatives/');
}

const siteswapGeneratorKeys = {
		nProps: 'props',
		period: 'period',
		maxThrow: 'max_throw',
		minThrow: 'min_throw',
		nJugglers: 'jugglers',
		include: 'include',
		exclude: 'exclude',
};

function siteswapGeneratorUrl(p)
{
	const urlParams = {};
	for (const [key, urlKey] of Object.entries(siteswapGeneratorKeys)) {
		if (p.hasOwnProperty(key))
			urlParams[urlKey] = p[key];
	}
	return U('/siteswap-generator', urlParams);
}

function jugglerName(i)
{
	return String.fromCharCode(65 + i);
}

function hands2limbs(hands, nJugglers)
{
	if (!hands)
		return false;

	hands = hands.replace(/[^a-z]/gi, '').toUpperCase();
	if ((hands.length % 2) || !hands.match(/^(.(R|L))*$/i))
		return false;

	const limbs = [];
	const seen = {};
	for (let i = 0; i < hands.length / 2; i++) {
		const def = hands.slice(i * 2, i * 2 + 2);
		if (seen[def])
			return false;
		seen[def] = true;
		const juggler = def.charCodeAt(0) - 65;
		if (juggler >= nJugglers)
			return false;

		limbs.push({
			juggler,
			type: {R:'right', L:'left'}[def[1]] + ' hand',
		});
	}
	return limbs;
}

function limbs2hands(limbs)
{
	return limbs
		.map(limb => jugglerName(limb.juggler) + limb.type[0])
		.join(' ');
}

function defaultLimbs(n)
{
	const result = [];
	for (let i = 0; i < 2 * n; i++) {
		const juggler = i % n;

		// alternating right and left for an odd number of jugglers makes the patterns more symmetric (Co Stuifbergen)
		const right = (n % 2) ? !(i % 2) : i < n;
		result.push({
			juggler,
			type: (right ? 'right' : 'left') + ' hand',
		});
	}
	return result;
}

const servertype = import.meta.env.VITE_SERVERTYPE || (dev ? 'dev' : '');

const jifdev = servertype == 'dev' || servertype == 'alpha';

const baseUrl = dev ? '' :
                'https://'
                 + (import.meta.env.VITE_SERVERTYPE ? import.meta.env.VITE_SERVERTYPE + '.' : '')
                 + 'passist.org';

export {
	defaults,
	useLocalStorage,
	siteswapUrl,
	siteswapAlternativesUrl,
	siteswapGeneratorKeys,
	siteswapGeneratorUrl,
	jugglerName,
	hands2limbs,
	limbs2hands,
	defaultLimbs,
	servertype,
	jifdev,
	baseUrl,
	U,
};
