import { siteswapGeneratorKeys } from '$lib/passist.mjs';

export function load({ url, params }) {
	const props = {};

	// get props from url searchParams
	for (const [key, urlKey] of Object.entries(siteswapGeneratorKeys)) {
		const val = url.searchParams.get(urlKey)
		if (val) {
			if (['include', 'exclude'].includes(key)) {
				props[key] = val;
			} else {
				const valInt = parseInt(val);
				if (!isNaN(valInt))
					props[key] = valInt;
			}
		}
	}

	return props;
}
