<svelte:options namespace=svg />

<script>
	export let jif;
	export let startConfigurations;
	export let steps = 1;
	export let url = '';

	let jugglers = {};
	const xoff = 55;
	const yoff = 70;
	const dy = 100;
	let dx;
	const r = 13
	let nJugglers;
	let nLines;
	let width, height;
	let nodes = {};
	const arrowLength = 20;

	function arrow(time, step, fromLine, toLine) {
		const time2 = time + step;
		if (fromLine != toLine || Math.abs(step) <= jif.timeStretchFactor)
			return "M" + xy(time, r, x(time2), y(fromLine), fromLine) + " L" + xy(time2, r + arrowLength, x(time), y(fromLine), toLine);
		const dirX = x(time2) > x(time) ? 1 : -1;
		const dirY = fromLine ? 1 : -1;

		const offsetX = dirX * dy / 2;
		const offsetY = dirY * dy / 2;

		const controlPoint1 = (x(time) + offsetX) + "," + (y(fromLine) + offsetY);
		const controlPoint2 = (x(time2) - offsetX) + "," + (y(fromLine) + offsetY);
		return "M" + xy(time, r, x(time) + dirX, y(fromLine) + dirY, fromLine)
				 + "C" + controlPoint1
				 + " " + controlPoint2
				 + " " + xy(time2, r + arrowLength, x(time2) - dirX, y(fromLine) + dirY, fromLine);
	};

	function x(time) { return xoff + time * dx;}
	function y(line) { return yoff + line * dy;}
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
		nJugglers = jif.jugglers.length;
		dx = 70 / jif.timeStretchFactor;

		nLines = nJugglers;
		width = steps * dx + 50;
		height = (nLines - (nLines > 1 ? 1 : 1.4)) * dy + 2 * yoff;

		nodes = [];
		const throws = jif.throws ? jif.throws : [];
		for (let i = 0; i < steps; i++) {
			const th = throws[i % throws.length];
			const time = th.time + Math.floor(i / throws.length) * jif.period;
			const fromLimb = jif.limbs[th.from];
			const isLeft = fromLimb.type && fromLimb.type.match(/left/);

			const fromLine = jif.limbs[th.from].juggler;
			const toLine = jif.limbs[th.to].juggler;

			nodes.push({
				r: r,
				x: x(time),
				y: y(fromLine),
				class: isLeft ? 'left' : 'right',
				label: th.label,
				arrow: arrow(time, th.duration - 2 * nJugglers, fromLine, toLine), // for ladder diagram: don't subtract 2 * nJugglers
			});
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
	.nodeLabel { fill: #343a40 }
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
		>{j.startPropsLeft}</text>

		<text
			x=20
			y={yoff + 30 + i * dy}
			font-size=20
			stroke-width=0px
			strke=black
		>{j.startPropsRight}</text>
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

		<!-- TODO allow more than one arrow per node -->
		{#if n.arrow}
			<path
				class=arrowStroke
				d={n.arrow}
				stroke-width=2px
				fill=none
				marker-end=url({url}#arrow)
			/>
		{/if}
	{/each}
</svg>

