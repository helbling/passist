/**
 * Symmetric siteswap
 */

import peggy from 'peggy';
import Siteswap from './siteswap.mjs';
import ExtendedSiteswap from './extended_siteswap.mjs';
import Jif from './jif.mjs';

const parser = ExtendedSiteswap.parser;


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

	// in-phase pattern, same start for every juggler
	this.jif = SymmetricSiteswap._inPhase(input, { nJugglers, nLimbs });

	if (!this.jif)
		this.jif = SymmetricSiteswap._inPhase(input, { options, nJugglers, nLimbs, flipped:true } );

	if (!this.jif)
		this.jif = SymmetricSiteswap._outOfPhase(input, { options, nJugglers, nLimbs } );

	if (!this.jif)
		this.jif = SymmetricSiteswap._outOfPhase(input, { options, nJugglers, nLimbs, flipped:true } );

	if (!this.error && this.jif) {
		try {
			this.completeJif = Jif.complete(this.jif, { expand:true, props:true }).jif;
			this._valid = true;
			this.nProps = this.completeJif.props.length;
		} catch (e) {
			this.error = e;
		}
	}
}

static _inPhase(input, p = {})
{
	let soloAst, flippedPasses;
	try {
		soloAst = parser.parse(input, {
			soloOnly:true,
			modifyThrows: (th) => {
				if (th.p && p.flipped)
					th.x = !th.x;
				th.p = null;
				return th;
			}
		});

		if (p.flipped)
			flippedPasses = parser.parse(input, {
				modifyThrows: (th) => {
					if (th.p)
						th.x = !th.x;
					return th;
				}
			});
	} catch (e) {
		return null;
	}

	const soloPattern = new ExtendedSiteswap(soloAst);

	if (!soloPattern.isValid())
		return null;

	console.log(input, 'in phase detected for ', input, p.flipped ? ' flipped' : '');

	const extendedSiteswap = new ExtendedSiteswap(
		Array(p.nJugglers).fill(
			p.flipped ?  ExtendedSiteswap.astToNotation(flippedPasses) : input
		),
	);
	const jifOptions = {
		flipTwos: true, // TODO: implement this
	};

	if (p.flipped) {
		// flip hands of every second juggler
		// this way for an even numer of jugglers, all passes are flipped
		// for an odd number of jugglers, most passes are flipped
		jifOptions.limbs = [];
		for (let i = 0; i < p.nLimbs; i++) {
			const juggler = Math.floor(i / 2);
			jifOptions.limbs.push({
				juggler,
				type: (((i ^ juggler) & 1) ? 'left' : 'right') + ' hand',
			});
		}
	}

	return extendedSiteswap.toJif(jifOptions);
}

static _outOfPhase(input, p = {})
{
	const { nJugglers, nLimbs, options } = p;
	let ast, soloAst, flippedPasses, period, prechacOffset;

	try {
		ast     = parser.parse(input, { fractionalDuration:true, soloOnly:true });
		period = ExtendedSiteswap.beatsToThrows(ast.beats).time;
		prechacOffset = period / nJugglers;

		soloAst = parser.parse(input, {
			fractionalDuration:true,
			soloOnly:true,
			modifyThrows: (th) => {
				if (th.p) {
					if (p.flipped)
						th.x = !th.x;
					th.duration += prechacOffset;
				}
				th.p = null;
				return th;
			}
		});

		if (p.flipped)
			flippedPasses = parser.parse(input, {
				fractionalDuration:true,
				modifyThrows: (th) => {
					if (th.p)
						th.x = !th.x;
					return th;
				}
			});
	} catch (e) {
// 		if (e.location)
// 			e.snippet = ExtendedSiteswap.error_snippet(e.location, input);
// 		this.error = e;
		return null;
	}

	const soloPattern = new ExtendedSiteswap(soloAst);

	if (!soloPattern.isValid())
		return null;

	console.log(input, 'out-of-phase detected for ', input, p.flipped ? ' flipped' : '');

	const repetition = {
		period: period * nJugglers
	};
	if (period & 1)
		repetition.limbPermutation = [...Array(nLimbs).keys()].map(limb => limb ^ 1);

	const throws = [];

	const beats = ast.beats;

	for (let juggler = 0; juggler < nJugglers; juggler++) {
		let time = juggler * prechacOffset;
		let from = juggler * 2;
		if ((juggler & 1) && ((Math.floor(prechacOffset) & 1) ^ p.flipped))
			from++;

		const btt = ExtendedSiteswap.beatsToThrows(
			beats, {
				nLimbs,
				from,
				time,
			}
		);
		time = btt.time;
		for (const thr0w of btt.throws) {
			thr0w.time     = Math.round((thr0w.time * nJugglers) % repetition.period);
			thr0w.duration = Math.round(thr0w.duration * nJugglers);

			// TODO: more general rule..
			if (nJugglers == 2 && (period & 1) && juggler == 1)
				thr0w.to ^= 1;

			// console.log(thr0w);
			throws.push(thr0w);
		}
	}

	const limbs = [];
	for (let i = 0; i < nLimbs; i++) {
		const juggler = Math.floor(i / 2);
		limbs.push({
			juggler,
			type: ((i & 1) ? 'left' : 'right') + ' hand',
		});
	}

	const jif = {
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
		repetition,
		timeStretchFactor: nJugglers,
	};

	return jif;
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
