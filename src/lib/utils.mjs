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
	return throwStyles.map(style => [
		style.label || '',
		'ordinal' in style ? style.ordinal : '',
		style.limbs ? style.limbs.sort((a,b)=>a-b).join('_') : '',
		style.what,
		style.value
	].join('~')).join('|');
}

function decodeThrowStyles(throwStylesParam)
{
	if (throwStylesParam) {
		return throwStylesParam.split('|').map(s => {
			let [label, ordinal, limbs, what, value] = s.split('~');
			const style = {what, value};

			if (value === undefined)
				return undefined;

			if (label !== '')
				style.label = label;

			if (ordinal !== '')
				style.ordinal = parseInt(ordinal);

			if (limbs !== '')
				style.limbs = limbs.split('_').map(_=>parseInt(_)).sort((a,b)=>a-b);

			return style;
		}).filter(s => s);
	}
	return [];
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
