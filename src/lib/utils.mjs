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

export {
	encodeUrlPathPart,
	U,
};
