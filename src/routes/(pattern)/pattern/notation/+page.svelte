<script>
import { marked } from 'marked';
import { appName, siteswapUrl, extendedSiteswapUrl } from '$lib/passist.mjs';

function patternLink(siteswap, url, params = {}) {
	return '[`'
		+ siteswap
		+ (params.nJugglers
			?  ' (' + params.nJugglers + ' juggler' + (params.nJugglers != 1 ? 's' : '') + ')'
			: '')
		+ '`]' + '(' + url + ')';
}

function global(siteswap, params = {}) {
	params.siteswapInput = siteswap;
	return patternLink(siteswap, siteswapUrl(params), params);
}
function extended(siteswap, params = {}) {
	params.siteswapInputs = siteswap;
	return patternLink(siteswap, extendedSiteswapUrl(params), params);
}

let source = `

### Global Siteswap
A sequence of numbers that define for every throw how many beats later the prop is thrown again.

See https://en.wikipedia.org/wiki/Siteswap#Vanilla for an in depth description.

Numbers bigger than 9 are encoded as characters where a = 10, b = 11, etc.
The default hand order is: right hand juggler 1, right hand juggler 2, ..., left hand juggler 1, left hand juggler 2, ...

Examples:
- ${global('7531',  {nJugglers: 1})}
- ${global('86277', {nJugglers: 2})}
- ${global('7a666', {nJugglers: 2})}

### Extended Siteswap
The following extensions to vanilla siteswap are allowed:

#### Multiplexes
Throws in square brackets are thrown simultaneously from the same hand. Example: ${extended(['24[54]'])}

#### Synchronous throws
Throws in round brackets are thrown left/right synchronously. Example: ${extended(['(4x,2x)'])}.
The 'x' means the throw should land in the other hand it would normaly land in. 

A star at the end means repeat the whole pattern mirrored. Example: ${extended(['(4,2x)*'])} is a shorthand for ${extended(['(4,2x)(2x,4)'])}

See also: https://en.wikipedia.org/wiki/Siteswap#Synchronous

By convention the left slot in the parenthesis is taken to correspond to the left hand.

Multiplexing can also be notated, exactly as above; for example the 4 ball pattern ${extended(['(4,2)(2x,[44x])'])} has a multiplexed '4' and '4x' thrown with the right hand.

#### Short-beat synchronous throws!
The usual sync throws \`(t1,t2)\` assume the beat immediately following the sync throw is empty (no throws occurring). So for a two-handed sync pattern, each hand throws every two beats, the same as async juggling. This preserves our intuitions for how high a throw X should be when we switch between sync and async patterns.

In some cases it may be desirable to break this assumption and allow a throw on the beat immediately following the sync throw. For this purpose you can use a "short-beat" sync throw by adding a \`'!'\` to the throw pair signifying no empty beat immediately following.

Sometimes writing async patterns in this way can help to think about patterns that switch between sync and async sections. For example: ${extended(['(4,5x)(4,1x)!(0,5x)!(4,0)!(0,1x)!'])}. The short-beat throw \`(4,1x)!\` has a short hold \`1x\` that changes the timing from sync to async.

### Synchronous passing

The notation \`<xxx|yyy>\` means one juggler does \`xxx\` while another does \`yyy\`. \`'p'\` is used to represent a passing throw. For example, ${extended(['<3p33|234p>'])} is a 6 prop three-count passing pattern, where the first juggler does a three count with single passes and the second juggler throws a three count with early double passes. This can also be used with left/right synchronous patterns; a two-person 'shower' is then ${extended(['<(2x,4xp)|(2x,4xp)>'])}.

You won't need to type in \'<\', \'>\' or \'|\', the user interface will do that for you. In case the pattern is repeated for all jugglers you can use an even simpler interface. For example here: ${extended(['<(2x,4xp)>'], {nJugglers:2})}.
`;

let markdown = marked(source);
</script>

<style>
.markdown {
    width: 100%;
    padding: 0 2em;
}
.markdown :global(a) { white-space: nowrap }
</style>

<svelte:head>
	<title>{appName} - Siteswap notation</title>
</svelte:head>

<div class="markdown">{@html markdown}</div>
