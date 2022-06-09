<script>
import { marked } from 'marked';

function pattern(siteswap) {
	return '[`' + siteswap + '`](/siteswap/' + encodeURIComponent(siteswap) + ')'; // TODO: fix links with a ',' in them!
}

export let source = `

## Siteswap notation

### Vanilla siteswap
A sequence of numbers that define for every throw how many beats later the prop is thrown again.

See https://en.wikipedia.org/wiki/Siteswap#Vanilla for an in depth description.

Numbers bigger than 9 are encoded as characters where a = 10, b = 11, etc.
The default hand order is: right hand juggler 1, right hand juggler 2, ..., left hand juggler 1, left hand juggler 2, ...

### Extended Siteswap
The following extensions to vanilla siteswap are allowed:

#### Multiplexes
Throws in square brackets are thrown simultaneously from the same hand. Example: ${pattern('24[54]')}

#### Synchronous throws
Throws in round brackets are thrown left/right synchronously. Example: ${pattern('(4x,2x)')}.
The 'x' means the throw should land in the other hand than that it would normaly land in. 

A star at the end means repeat the whole pattern mirrored. Example: ${pattern('(4,2x)')}

See also: https://en.wikipedia.org/wiki/Siteswap#Synchronous

By convention the left slot in the parenthesis is taken to correspond to the left hand. Multiplexing can also be notated, exactly as above; for example the 4 ball pattern ${pattern('(4,2)(2x,[44x])')} has a multiplexed '4' and '4x' thrown with the right hand.

### Passing

Simultaneous juggling: \`<xxx|yyy>\` notation means one juggler does 'xxx' while another does 'yyy'. \`'p'\` is used to represent a passing throw. For example, ${pattern('<3p 3|3p 3>')} is a 6 prop '2 count' passing pattern, where all right hand throws are passes and left hand throws are selves. This can also be used with synchronous patterns; a two-person 'shower' is then ${pattern('<(4xp,2x)|(4xp,2x)>')}

`;
// TODO:
// - !

let markdown = marked(source);
</script>

<style>
.markdown {
    width: 100%;
    padding: 0 2em;
}
</style>

<svelte:head>
	<title>passist - Siteswap notation</title>
</svelte:head>

<div class="markdown">{@html markdown}</div>
