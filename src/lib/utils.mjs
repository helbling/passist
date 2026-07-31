function U(path, query = {})
{
	const queryPart = Object.entries(query).map(
		([key, val]) => `${key}=${encodeURIComponent(val)}`
	).join('&');
	return path + (queryPart ? (path.match(/\?/) ? '&' : '?') + queryPart : '');
}

function encodeUrlPathPart(string)
{
	return encodeURI(string).replaceAll('?', '%3F').replaceAll('#', '%23').replaceAll('%5B', '[').replaceAll('%5D', ']');
}

function encodeThrowStyles(throwStyles)
{
	return throwStyles.map(style =>
		[
			style.label && 'label-' + style.label,
			'ordinal' in style ? 'nth-' + style.ordinal : '',
			style.limbs ? 'limbs-' + style.limbs.sort((a,b)=>a-b).join('_') : '',
			style.what + '-' + style.value
		].filter(a => a).join('~')
	).join('|');
}

function decodeThrowStyles(throwStylesParam)
{
	if (throwStylesParam) {
		return throwStylesParam.split('|').map(s => {
			const parts = s.split('~');
			if (parts.length < 1)
				return undefined;

			let [what, value] = parts.pop().split('-');

			if (value === undefined)
				return undefined;

			if (what == 'spins')
				value = parseInt(value); // currently only integer spins supported
			else if (what == 'dwell')
				value = parseFloat(value);
			else
				return undefined;

			const style = {what, value};

			for (const part of parts) {
				const [k, v] = part.split('-');
				if (k == 'label')
					style.label = v;
				else if (k == 'nth')
					style.ordinal = parseInt(v);
				else if (k == 'limbs')
					style.limbs = v.split('_').map(_ => parseInt(_)).sort((a,b) => a-b);
			}

			return style;
		}).filter(s => s);
	} else {
		return [];
	}
}

function getThrowStyles(url)
{
	return decodeThrowStyles(url.searchParams.get('throw_styles'));
}


export {
	decodeThrowStyles,
	encodeThrowStyles,
	encodeUrlPathPart,
	getThrowStyles,
	U,
};
