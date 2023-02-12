/**
 * Symmetric siteswap
 */

import peggy from 'peggy';
import Siteswap from './siteswap.mjs';
import ExtendedSiteswap from './extended_siteswap.mjs';
import Jif from './jif.mjs';

const parser = ExtendedSiteswap.parser;


function beatsToBeatmap(beats, {nLimbs = 2, from = 0} = {})
{
	const { throws, time:period } = ExtendedSiteswap.beatsToThrows(beats, { nLimbs, from });
	const beatmap = Array.from(Array(period), () => Array.from(Array(nLimbs), () => []));

	for (const thr0w of throws) {
		console.log(thr0w);
		beatmap[thr0w.time][thr0w.from].push(thr0w);
	}
	return beatmap;
}

function beatmapToNotation(beatmap)
{
	const nJugglers = beatmap[0].length / 2;
	let notations = [];
	for (let j = 0; j < nJugglers; j++) {
		// TODO
	}
}

export default class SymmetricSiteswap {

/**
 *  constructs a new symmetric siteswap
 *  for two jugglers by default
 *
 *  params:
 *  - input: a string with a symmetric siteswap pattern
 *  - options: object with the following optional keys:
 *     - jugglers/limbs/props according to the JIF specification
 *     - name: pattern name
 */
constructor(input, options = {})
{
	options = Object.assign({
		jugglers: [{}, {}],
	}, options);
	const nJugglers = options.jugglers.length;

	this.notation = input; // in case we can't parse it

	console.log(input); // NOCOMMIT

	let ast, soloAst;
	try {
		ast     = parser.parse(input, { fractionalDuration:true, soloOnly:true });
		soloAst = parser.parse(input, { fractionalDuration:true, soloOnly:true, ignorePasses:true });
	} catch (e) {
		if (e.location)
			e.snippet = ExtendedSiteswap.error_snippet(e.location, input);
		this.error = e;
		return;
	}

	const soloExtendedSiteswap = new ExtendedSiteswap(soloAst);
	if (soloExtendedSiteswap.isValid()) {
		// in-phase pattern, same start for every juggler
		console.log(input, 'in phase detected for ', input);

		const extendedSiteswapInput = Array(nJugglers).fill(input);
		const es = new ExtendedSiteswap(extendedSiteswapInput, {individualPatterns:true, nJugglers}); // TODO: better extended siteswap options..

		const nProps = es.nProps();
		this.jif = es.toJif({
			flipTwos: true, // TODO: implement this
			props: Array.from(Array(nProps), () => { return {}; }),
		});
	} else {

	// 	// if valid siteswap without p ==> In phase pattern (same start for every juggler)
	// 	// TODO
	// 	console.log('bb', ExtendedSiteswap.beatsToBeatmap(ast.beats));

		// TODO: better: ast => beatmap -> manipulations -> ast -> notation
		const period = ExtendedSiteswap.beatsToThrows(ast.beats).time;
		const prechacOffset = period / nJugglers;
		console.log('offset:', prechacOffset);

		let integerDurations = true;
		ast.beats.forEach((beat) => {
			if (beat.type == 'async') {
				beat.throws.forEach((thr0w) => {
					if (thr0w.p) {
						thr0w.p = null;
						const duration = thr0w.duration + prechacOffset;
						thr0w.duration = Math.round(duration);
						if (Math.abs(thr0w.duration - duration) > 0.1)
							integerDurations = false;
					}
				});
			} else {
				// throw new Error("beat type " + beat.type + " not implemented");
			}
		});
		console.log(ast, integerDurations);

		if (integerDurations) {
			// TODO: use extended siteswap itself for this solo validity test
			// to make cases like (4,2x)* possible!
			const soloSiteswap = new Siteswap(ExtendedSiteswap.astToNotation(ast));
			if (soloSiteswap.isValid()) {
				console.log(input, 'prechac detected');
			}
			console.log(ExtendedSiteswap.astToNotation(ast));

			// TODO: handle non-integer offsets!
			// TODO: don't use string manipulation here -> not save on extended siteswaps!
			const notation = input;
			input = [];
			for (let j = 0; j < nJugglers; j++)
				input.push(
					notation.slice(   j * prechacOffset) +
					notation.slice(0, j * prechacOffset)
				);
			console.log(input);
		} else {
			// console.log(ast);
			return;
		}
	}
}

isValid()
{
	if (this.error || !this.jif)
		return false;

	try {
		this.completeJif = Jif.complete(this.jif, { expand:true, props:true }).jif;
	} catch (e) {
		this.error = e;
		return false;
	}

	return true;
}

toString()
{
	return this.notation;
}

toJif()
{
	return this.jif;
}

nProps()
{
	if (!this.isValid())
		return NaN;

	return this.completeJif.props.length;
}

}
