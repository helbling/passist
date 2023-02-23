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

	this._valid = false;
	this.nProps = NaN;

	const nJugglers = options.jugglers.length;
	const nLimbs = nJugglers * 2;

	this.notation = input; // in case we can't parse it

	console.log(input); // NOCOMMIT

	let ast, soloAst,soloAst2;
	try {
		ast     = parser.parse(input, { fractionalDuration:true, soloOnly:true });
		soloAst = parser.parse(input, {
			fractionalDuration:true,
			soloOnly:true,
			modifyThrows: (th) => {
				th.p = null;
				return th;
			}
		});
		// TODO: make 4px23 work by switching hands of juggler B
		soloAst2 = parser.parse(input, {
			fractionalDuration:true,
			soloOnly:true,
			modifyThrows: (th) => {
				if (th.p) {
					th.x = !th.x;
					th.p = null;
				}
				return th;
			}
		});
	} catch (e) {
		if (e.location)
			e.snippet = ExtendedSiteswap.error_snippet(e.location, input);
		this.error = e;
		return;
	}

	const soloExtendedSiteswap = new ExtendedSiteswap(soloAst);
	// const soloExtendedSiteswap2 = new ExtendedSiteswap(soloAst2);
	if (soloExtendedSiteswap.isValid()) {
		// in-phase pattern, same start for every juggler
		console.log(input, 'in phase detected for ', input);

		const extendedSiteswapInput = Array(nJugglers).fill(input);
		const es = new ExtendedSiteswap(extendedSiteswapInput, { nJugglers}); // TODO: better extended siteswap options..

		const nProps = es.nProps;
		this.jif = es.toJif({
			flipTwos: true, // TODO: implement this
			props: Array.from(Array(nProps), () => { return {}; }),
		});
	} else if (soloExtendedSiteswap2.isValid()) {
		console.log(input, 'in phase detected for ', input, ' crossed');

		// TODO: flip B-s hands
		// TOOD: more general?
		const extendedSiteswapInput = Array(nJugglers).fill(input);
		const es = new ExtendedSiteswap(extendedSiteswapInput, { nJugglers}); // TODO: better extended siteswap options..

		const nProps = es.nProps;
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


		// nProps?
		// props: Array.from(Array(nProps), () => { return {}; }),

		const throws = [];

		const beats = ast.beats;
		console.log(beats);

		for (let juggler = 0; juggler < nJugglers; juggler++) {
			let time = juggler * prechacOffset;
			let from = juggler * 2;
			for (let i = 0; i < nJugglers; i++) {
				const btt = ExtendedSiteswap.beatsToThrows(
					beats, {
						nLimbs,
						from,
						time,
					}
				);
				// console.log('j', juggler, btt);
				time = btt.time;
				from = btt.from;
				for (const thr0w of btt.throws) {
			// for (const thr0w of ExtendedSiteswap.beatsToThrows(
			// 	beats, {
			// 		nLimbs,
			// 		from: juggler * 2,
			// 		time,
			// 	}
			// ).throws) {
					// console.log('tt', thr0w.time, period);
					thr0w.time     = Math.round((thr0w.time % (period * nJugglers * nJugglers)) * nJugglers);
					thr0w.duration = Math.round(thr0w.duration * nJugglers);

					// TODO: more general rule..
					if (nJugglers == 2 && (period & 1) && juggler == 1)
						thr0w.to ^= 1;

						// console.log(juggler, thr0w);
					throws.push(thr0w);
				}
			}
		}

		const limbs = [];
		for (let i = 0; i < nLimbs; i++) {
			limbs.push({
				juggler: Math.floor(i / 2),
				type: ((i & 1) ? 'left' : 'right') + ' hand',
			});
		}

		this.jif = {
			meta: {
				name: options.name ? options.name : 'symmetric siteswap ' + input,
				generator: 'passist', // TODO: put version of package.json here again
			},
			highLevelDescription: {
				type: 'symmetricSiteswap',
				description: input,
			},
			jugglers: options.jugglers,
			limbs,
			// limbs:    options.limbs, // TODO
			// props:    options.props, // TODO
			throws,
			repetition: { period: period * nJugglers * nJugglers },
			timeStretchFactor: nJugglers,
		};
		console.log(this.jif);

		// this._valid = false;
		// return;

		// do we need a validity test here?
		// or is jif.complete enough


// 		let integerDurations = true;
// 		ast.beats.forEach((beat) => {
// 			if (beat.type == 'async') {
// 				beat.throws.forEach((thr0w) => {
// 					if (thr0w.p) {
// 						thr0w.p = null;
// 						const duration = thr0w.duration + prechacOffset;
// 						thr0w.duration = Math.round(duration);
// 						if (Math.abs(thr0w.duration - duration) > 0.1)
// 							integerDurations = false;
// 					}
// 				});
// 			} else {
// 				// throw new Error("beat type " + beat.type + " not implemented");
// 			}
// 		});
// 		console.log(ast, integerDurations);

// 		if (integerDurations) {
// 			// TODO: use extended siteswap itself for this solo validity test
// 			// to make cases like (4,2x)* possible!
// 			const soloSiteswap = new Siteswap(ExtendedSiteswap.astToNotation(ast));
// 			if (soloSiteswap.isValid()) {
// 				console.log(input, 'prechac detected');
// 			}
// 			console.log(ExtendedSiteswap.astToNotation(ast));

// 			// TODO: handle non-integer offsets!
// 			// TODO: don't use string manipulation here -> not save on extended siteswaps!
// 			const notation = input;
// 			input = [];
// 			for (let j = 0; j < nJugglers; j++)
// 				input.push(
// 					notation.slice(   j * prechacOffset) +
// 					notation.slice(0, j * prechacOffset)
// 				);
// 			console.log(input);
// 		} else {
// 			// console.log(ast);
// 			return;
// 		}
	}

	if (!this.error && this.jif) {
		try {
			this.completeJif = Jif.complete(this.jif, { expand:true, props:true }).jif;
		} catch (e) {
			this.error = e;
			console.log(e); /// NOCOMMIT
		}
	}
	if (!this.error) {
		this._valid = true;
		this.nProps = this.completeJif.props.length;
	}
}

isValid()
{
	return this._valid;
}

toString()
{
	return this.notation;
}

toJif()
{
	return this.jif;
}

}
