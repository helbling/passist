<svelte:options namespace=svg />

<script>
	export let jif;
	export let startConfigurations;
	export let isLadderDiagram = false;
	import Jif from '$lib/jif.mjs';

	let jugglers = {};
	const xoff = 80;
	const yoff = 70;
	const dy = 100;
	let dx;
	const r = 13
	let _jif;
	let nJugglers;
	let timeStretchFactor;
	let causalDiagramOffset;
	let width, height;
	let period = 1;
	let nodes = {};

	const arrowLength = 20;

	let jugglerHasCollision = [];
	let line2y = [];

	function line(limbId, jif) {
		const limb = jif.limbs[limbId];
		const isLeft = limb.type && limb.type.match(/left/);
		return limb.juggler * 2 + (isLeft ? 0 : 1);
	}
	function arrow(time, step, fromLine, toLine) {
		const time2 = time + step;

		// do we need a curved line?
		if (y(fromLine) != y(toLine) || Math.abs(step) >= timeStretchFactor * 0.7 && Math.abs(step) <= timeStretchFactor) // TODO: add collision detection
			return "M" + xy(time, r, x(time2), y(toLine), fromLine) + " L" + xy(time2, r + arrowLength, x(time), y(fromLine), toLine);
		let dirX = x(time2) > x(time) ? 1 : -1;


		const dirY = y(fromLine) == y(fromLine ^ 1) ?
			(fromLine > 1 ? 1 : -1)      // left-right on same line
			: ((fromLine & 1) ? 1 : -1); // line split into left/right

		let offsetX = dirX * dy / 2;
		const offsetY = dirY * dy / 2;

		if (step == 0) {
			offsetX /= 2;
			dirX /= 2;
		} else if (Math.abs(step) < timeStretchFactor) {
			offsetX = 0;
			dirX = 0;
		}

		const controlPoint1 = (x(time) + offsetX) + "," + (y(fromLine) + offsetY);
		const controlPoint2 = (x(time2) - offsetX) + "," + (y(fromLine) + offsetY);
		return "M" + xy(time, r, x(time) + dirX, y(fromLine) + dirY, fromLine)
				 + "C" + controlPoint1
				 + " " + controlPoint2
				 + " " + xy(time2, r + arrowLength, x(time2) - dirX, y(fromLine) + dirY, toLine);
	};

	function x(time) { return xoff + time * dx;}
	function y(line) { return line2y[line] || 0 }
	function xy(time, shorten, towardsX, towardsY, line) {
		let X = x(time);
		let Y = y(line);
		if (shorten) {
			const dx = towardsX - X;
			const dy = towardsY - Y;
			const len = Math.sqrt(dx * dx + dy * dy);
			X += shorten * dx / len;
			Y += shorten * dy / len;
		}
		return X + ',' + Y;
	}

$: {
		_jif = Jif.complete(jif, { expand:true, props:false } ).jif;
		const throws = _jif.throws;

		period = _jif.repetition.period;
		timeStretchFactor = _jif.timeStretchFactor;
		causalDiagramOffset = isLadderDiagram ? 0 : 2 * timeStretchFactor;
		nJugglers = _jif.jugglers.length;
		dx = 70 / timeStretchFactor;

		const minSteps = 5 * timeStretchFactor;
		const nPeriods = Math.ceil(minSteps / period);

		width = period * nPeriods * dx + 70;

		nodes = [];
		if (throws && throws.length > 0) {

			// check for collisions
			const timesByJuggler = Array.from(Array(nJugglers), () => []);
			throws.forEach((th, i) => {
				const juggler = _jif.limbs[th.from].juggler;
				timesByJuggler[juggler].push(th.time);
			});
			jugglerHasCollision = [];
			timesByJuggler.forEach((times, juggler) => {
				let last;
				for (const time of times) {
					if (last !== undefined && (time - last) * dx <= 2 * r + 10) {
						jugglerHasCollision[juggler] = true;
						break;
					}
					last = time;
				};
			});


			// calculate line2y
			let offset = yoff;
			line2y = [];
			for (let i = 0; i < nJugglers; i++) {
				line2y.push(offset);
				if (jugglerHasCollision[i])
					offset += dy / 2.5;
				line2y.push(offset);
				offset += dy;
			}
			line2y = line2y;
			height = offset;


			// TODO: avoid copy-pasta (Jif._completeOrbits)
			// TODO: make this less hacky and make it work for patterns with implicit holds

			// https://stackoverflow.com/a/17369245
			function countDecimals(x) {
				if (Math.floor(x) === x)
					return 0;

				var str = '' + x;
				if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
					return str.split("-")[1] || 0;
				} else if (str.indexOf(".") !== -1) {
					return str.split(".")[1].length || 0;
				}
				return str.split("-")[1] || 0;
			}

			const timePrecision = Math.max(
				0,
				...throws.map(t => countDecimals(t.time)),
				...throws.map(t => countDecimals(t.duration))
			);

			function getKey(thr0w, type) {
				let time = thr0w.time + (type == 'catch' ? thr0w.duration + period * 2 * timeStretchFactor - causalDiagramOffset : 0);
				if (period)
					time = time % period;
				return time.toFixed(timePrecision) + '|' + thr0w[type == 'catch' ? 'to' : 'from'];
			}

			const balance = {};

			throws.forEach((th, i) => {
				const throwKey = getKey(th, 'throw');
				const catchKey = getKey(th, 'catch');

				balance[throwKey] = (balance[throwKey] ? balance[throwKey] : 0) - 1;
				balance[catchKey] = (balance[catchKey] ? balance[catchKey] : 0) + 1;
			});

			for (let i = 0; i < throws.length * nPeriods; i++) {
				const th = throws[i % throws.length];
				const time = th.time + Math.floor(i / throws.length) * period;
				const fromLimb = _jif.limbs[th.from];
				const isLeft = fromLimb.type && fromLimb.type.match(/left/);

				const fromLine = line(th.from, _jif);
				const toLine   = line(th.to,   _jif);

				const nodeKey = getKey(th, 'throw');
				nodes.push({
					r: r,
					x: x(time),
					y: y(fromLine),
					class: (isLeft ? 'left' : 'right') + ' ' + (balance[nodeKey] > 0 ? 'jammed' : (balance[nodeKey] < 0 ? 'exhausted' : '')),
					label: th.label,
					arrow: arrow(time, th.duration - causalDiagramOffset, fromLine, toLine), // for ladder diagram: don't subtract 2 * timeStretchFactor
				});
			}
		}
		nodes = nodes; // update svelte state
	}
</script>

<style>
	.arrowStroke { stroke:#007bff }
	.arrowFill   {   fill:#007bff }
	circle { stroke:#343a40 }
	circle.right { fill:white }
	circle.left  { fill:#b7c8d5 }
	circle.jammed     { stroke:red; stroke-width:3 }
	circle.exhausted  { stroke:orange; stroke-width:3 }
	.nodeLabel { fill: #343a40 }
	svg { background-color:#fff }
</style>

<svg {width} {height}>
	<defs>
		<marker
			id=arrow
			markerWidth=10
			markerHeight=10
			refX=0
			refY=3
			orient=auto
			markerUnits=strokeWidth>
			<path
				class=arrowFill
				d='M0,0 L0,6 L9,3 z'
			/>
		</marker>
		<clipPath id="arrow_clip">
			<rect x={xoff - 40} y="0" width={width - xoff + 40} {height} />
		</clipPath>
	</defs>
	<rect
		x=0
		y=0
		{width}
		{height}
		stroke=#ccc
		stroke-width=2px
		fill=none
	/>

	{#if startConfigurations}
		{#each startConfigurations as j, i}
			<text
				x=10
				y={yoff + 9 + i * dy}
				font-size=20
				stroke-width=0px
				strke=black
			>{j.name}</text>

			<text
				x=20
				y={yoff - 10 + i * dy}
				font-size=20
				stroke-width=0px
				strke=black
			>{j.startProps['left hand'] || 0}</text>

			<text
				x=20
				y={yoff + 30 + i * dy}
				font-size=20
				stroke-width=0px
				strke=black
			>{j.startProps['right hand'] || 0}</text>
		{/each}
	{/if}

	{#each nodes as n}
		<circle
			cx={n.x}
			cy={n.y}
			r={n.r}
			class={n.class}
			stroke=black
			stroke-width=2
		/>
		<text
			x={n.x}
			y={n.y + 5}
			class=nodeLabel
			font-size=16
			stroke-width=0px
			text-anchor=middle
		>{n.label}</text>
	{/each}

	<g clip-path="url(#arrow_clip)">
		<g id=arrows>
		{#each nodes as n}
			<!-- TODO allow more than one arrow per node -->
			{#if n.arrow}
				<path
					class=arrowStroke
					d={n.arrow}
					stroke-width=2px
					fill=none
					marker-end=url(#arrow)
				/>
			{/if}
		{/each}
		</g>

		<!-- should be enough even for siteswap z -->
		{#each Array(10) as _, index (index)}
			<use xlink:href="#arrows" transform="translate({-period * dx * index + 1}, 0)" />
		{/each}
	</g>

</svg>
