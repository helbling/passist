/**
 * Symmetric siteswap
 */

import ExtendedSiteswap from './extended_siteswap.mjs';
import Jif from './jif.mjs';

const parser = ExtendedSiteswap.parser;

/**
 * returns the permutation when applied n times
 */
function permutation_power(permutation, n)
{
	if (n < 0)
		throw new Error("permutation power for n < 0 not implemented");

	if (n == 0)
		return permutation.map((_, k) => k); // identity

	let result = [...permutation]; // clone

	// simple and slow implementation
	// O(n) * permutation.length
	// could run in O(log(n)) * permutation.length with proper algo
	while (n > 1) {
		result = result.map(v => permutation[v]);
		n--;
	}
	return result;
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
	const throwStyles = options?.throwStyles;

	this.notation = input; // in case we can't parse it

	// in-phase pattern, same start for every juggler
	this.jif = SymmetricSiteswap._inPhase(input, { nJugglers, nLimbs,throwStyles });

	if (!this.jif)
		this.jif = SymmetricSiteswap._inPhase(input, { options, nJugglers, nLimbs, throwStyles, flipped:true } );

	if (!this.jif)
		this.jif = SymmetricSiteswap._outOfPhase(input, { options, nJugglers, nLimbs, throwStyles } );

	if (!this.jif)
		this.jif = SymmetricSiteswap._outOfPhase(input, { options, nJugglers, nLimbs, throwStyles, flipped:true } );

	if (!this.error && this.jif) {
		try {
			this.completeJif = Jif.complete(this.jif, { expand:true, props:true }).jif;
			this._valid = true;
			this.nProps = this.completeJif.props.length;
			this.jif.props = this.completeJif.props;
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

	// console.log(input, 'in phase detected for ', input, p.flipped ? ' flipped' : '');

	const extendedSiteswap = new ExtendedSiteswap(
		Array(p.nJugglers).fill(
			p.flipped ?  ExtendedSiteswap.astToNotation(flippedPasses) : input
		),
		{
			throwStyles: p.throwStyles
		}
	);
	const jifOptions = {
		flipTwos: true, // TODO: implement this
		throwStyles: p.throwStyles,
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
	let ast, soloAst, period, prechacOffset, btt;

	try {
		const parserOptions = { fractionalDuration:true, soloOnly:true };
		if (p.flipped)
			parserOptions.modifyThrows = (th) => {
				if (th.p)
					th.x = !th.x;
				return th;
			};
		ast     = parser.parse(input, parserOptions);
		btt     = ExtendedSiteswap.beatsToThrows(ast.beats, { nLimbs });
		period = btt.time;
		prechacOffset = period / nJugglers;

		soloAst = parser.parse(input, {
			fractionalDuration:true,
			soloOnly:true,
			modifyThrows: (th) => {
				if (th.p) {
					if (p.flipped)
						th.x = !th.x;
					th.duration = Math.round((th.duration - prechacOffset + period) * 10) / 10;
					if (nJugglers == 3 && (th.duration % 1 > 0.9))
						th.duration += 0.1; // allow "3.6p 3" for 3 jugglers as well, not just "3.7p 3" or more precision
				}
				th.p = null;
				return th;
			}
		});

		if (p.flipped)
			parser.parse(input, {
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

	// console.log(input, 'out-of-phase detected for ', input, p.flipped ? ' flipped' : '');

	const repetition = {
		// period: period * nJugglers
		period: period
	};

	// if (ast.star || period & 1)
	// 	repetition.limbPermutation = [...Array(nLimbs).keys()].map(limb => limb ^ 1);

	const throws = [];

	const simultaneous = (period % (nLimbs / 2) == 0);

	if (period % nLimbs == 0)
		repetition.limbPermutation = Array.from({length: nLimbs}, (_, i) => (i + 2) % nLimbs);
	else if (simultaneous)
		repetition.limbPermutation = Array.from({length: nLimbs}, (_, i) => ((i + 2) ^ 1) % nLimbs);
	else {
		const permutation = Array.from({length: nLimbs}, (_, i) => i + 2 < nLimbs ? i + 2 : 1 - (i + 2 - nLimbs));
		repetition.limbPermutation = permutation_power(permutation, period % nLimbs);
	}

	let lastJuggler = -1;
	let flipSides = 0;
	for (const th of btt.throws) {
		let juggler = Math.floor(th.time * nJugglers / period);
		if (simultaneous)
			juggler = (nJugglers - juggler) % nJugglers;

		th.time     = Math.round((th.time * nJugglers) % repetition.period);
		th.duration = Math.round(th.duration * nJugglers);

		// TODO: in some cases we need to flip left-right here!
		th.from = (th.from + juggler * 2) % nLimbs;
		th.to   = (th.to   + juggler * 2) % nLimbs;

		if (lastJuggler != juggler)
			flipSides = th.from & 1; // TODO: make sure this also works with sync throws and multiplexes!

		th.from ^= flipSides;
		th.to ^= flipSides;

		if ((th.from | 1) != (th.to | 1)) { // pass
			if (nJugglers == 2 && !simultaneous && juggler & 1)
				th.to ^= 1;
			// TODO: what about nJugglers > 2?

			if (!simultaneous)
				th.to = (th.to + 2 * ((th.duration % nJugglers) - 1)) % nLimbs;
		}

		lastJuggler = juggler;


	if (Array.isArray(options.throwStyles)) {
			for (const style of options.throwStyles) {
				if (
					(style.label == 'all' || style.label == th.label)
					// && (style.jugglers < 0 || style.jugglers == th.from) // TODO: implement this
					&& (!style.ordinal || style.ordinal == th._throwStyleOrdinal)
				) {
					th[style.what] = style.value;
				}
			}
		}

		throws.push(th);
	}

	// TODO: consider options.limbs?
	const limbs = [];
	for (let i = 0; i < nLimbs; i++) {
		const juggler = Math.floor(i / 2);
		limbs.push({
			juggler,
			type: (((i ^ (p.flipped ? juggler : 0)) & 1) ? 'left' : 'right') + ' hand',
		});
	}

	let _prechacthisUrl = '';
	if (nJugglers == 2 && limbs.length == 4) {
		_prechacthisUrl = 'http://prechacthis.takeouts.eu/info.php?pattern=['
			+ throws.map(th => {
				var h = th.duration / 2;
				return 'p(' + h + (limbs[th.from].juggler == limbs[th.to].juggler ? ',0,' + h : ',1,' + (h + period / 2)) + ')';
			}).join(',')
		+ ']&persons=2'; // + (p.flipped ? '&swap=[0]' :''); // TODO: find out how swap= on prechacthis works..
	}

	const jif = {
		meta: {
			name: options.name ? options.name : 'symmetric siteswap ' + input,
			generator: 'passist', // TODO: put version of package.json here again
			_prechacthisUrl,
		},
		highLevelDescription: {
			type: 'symmetricSiteswap',
			description: input,
		},
		jugglers: options.jugglers,
		limbs,
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
