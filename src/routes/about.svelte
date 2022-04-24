<script>
import { marked } from 'marked';
export let source = `

## Purpose
This is the passing siteswap assistant helping you to find, start and animate [passing](https://en.wikipedia.org/wiki/Passing_(juggling)) patterns. 

It's currently based around [siteswaps](https://en.wikipedia.org/wiki/Siteswap). Hopefully it will support a much wider pattern variety one day.

Solo siteswaps are supported as well by changing the number of jugglers to one.

## Features
- Siteswap generator
- Start configuration calculator
- Causal Diagrams
- Web App that works offline
- Reusable js components
- 3d Animation

## Browser support
Should run in any modern desktop or mobile browser which supports WebGL.

## Code

The code is open source and available in this <a href="https://github.com/helbling/passist/">Github project</a>.
You're welcome to contribute or fill bug reports there.

## Tools used

This project builds upon the follwing open source tools. Many thanks to its creators!

- [svelte](https://svelte.dev/) for handling state
- [svelte-kit](https://kit.svelte.dev/) for building the web application
- [three.js](https://threejs.org/) for doing all the complicated 3d stuff
- [bytesize-icons](https://danklammer.com/bytesize-icons/) for the iconset
- [Pure.css](https://purecss.io/) as a good css base
- [Svelte-DragDropList](https://github.com/jwlarocque/svelte-dragdroplist) for hand order drag and drop

# Pattern sources

- [Well known siteswaps](https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt) from Christian Kästner
- [Juggling Lab](https://jugglinglab.org/) from Jack Boyce for a list of extended siteswaps

## License

Copyright 2022 Christian Helbling (helch at [same five letters again] dot ch)

Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html

`;
let markdown = marked(source);
</script>

<style>
.markdown {
    width: 100%;
    padding: 0 2em;
}
</style>

<svelte:head>
	<title>passist - About</title>
</svelte:head>


<div class="markdown">{@html markdown}</div>
