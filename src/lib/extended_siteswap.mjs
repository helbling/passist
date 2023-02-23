import peggy from 'peggy';
import Siteswap from './siteswap.mjs';
import Jif from './jif.mjs';
import { encodeUrlPathPart } from './utils.mjs';

const grammar = `
{
	function zip(rows) { // https://stackoverflow.com/a/10284006
		return rows[0].map((_,c)=>rows.map(row=>row[c]));
	}

	const modifyThrows = options.modifyThrows ? options.modifyThrows : (x) => x;
}

  // jugglinglab pattern grammar for peggy
  // =====================================
  //
  // see https://jugglinglab.org/html/ssnotation.html

  Pattern
    = _ beats:Solo+       _ star:Star? _ { return { type:"solo",    star, beats    }; }
    / _ passings:Passing+ _ star:Star? _ &{ return !options.soloOnly } {
		if (!passings.every(x => x.length == passings[0].length))
			throw new Error("not all passings have the same number of jugglers");
        return { type:"passing", star,
                 beats: zip(passings).map(arrays => [].concat(...arrays)) };
        }

  Star
    = "*" { return true }

  Passing
    = "<" _ head:Solo+ tail:( _ "|" _ Solo+ )* _ ">" _ {
        return [head, ...tail.map(x => x[3])];
      }

  Solo
    = Async / Sync

  Sync
    = _ "(" _ left:Async _ "," _ right:Async _ ")" short:"!"? _ {
        return { type:"sync", left, right, short:!!short };
      }

  Async
    = _ m:Multiplex _ _ {
        return { type:"async", throws:m };
      }


  Multiplex
    =  _ "[" _ t:Throw+ _ "]" _ { return  t; }
    /  _ t:Throw                { return [t]; }

  Throw
    = duration:Duration _ x:X _ p:P     _ { return modifyThrows({ duration, p, x }); }
    / duration:Duration _ p:P _ x:X     _ { return modifyThrows({ duration, p, x }); }
	/ duration:Duration _ p:P ? _ x:X ? _ { return modifyThrows({ duration, p, x }); }

  P
    = "p" { return true }

  X
    = "x" { return true }

  Duration "duration"
    = _ char:[0-9a-o] fraction:('.' [0-9]+)? &{ return options.fractionalDuration || !fraction }
      { return (char.match(/[0-9]/) ? +char : (char.charCodeAt(0) - 'a'.charCodeAt(0) + 10)) + (fraction ? +('0.'+fraction[1].join('')) : 0); }

  _ "whitespace"
    = [ \\t\\n\\r]*
`

const parser = peggy.generate(grammar);

function label(t)
{
	let result = Siteswap.heightToChar(t.duration);
	for (const key of ['p', 'x'])
		if (t[key])
			result += key;
	return result;
}

function addTo(jifThrow, astThrow, nLimbs)
{
	let to = jifThrow.from;

	// cross throws
	if (astThrow.x ^ (astThrow.duration & 1))
		to ^= 1;

	// passes
	if (astThrow.p)
		to = (to + 2) % nLimbs;

	jifThrow.to = to;

	return jifThrow;
}

function beatsToThrows(beats, {nLimbs = 2, from = 0, time = 0 } = {})
{
	const throws = [];
	const initialFrom = from;
	for (const beat of beats) {

		if (beat.type == 'async') {
			for (const t of beat.throws)
				throws.push(addTo({
					time,
					duration: t.duration,
					label: label(t),
					from,
				}, t, nLimbs));

			from ^= 1;
			time++;
		} else if (beat.type == 'sync') {
			for (const t of beat.left.throws)
				throws.push(addTo({
					time,
					duration: t.duration,
					from: from | 1,
					label: label(t),
				}, t, nLimbs));

			for (const t of beat.right.throws)
				throws.push(addTo({
					time,
					duration: t.duration,
					from: from & ~1,
					label: label(t),
				}, t, nLimbs));

			from = initialFrom;
			time += beat.short ? 1 : 2;
		} else {
			throw new Error(`beat.type '$(beat.type)' not handled`);
		}
	}
	return { throws, time, from };
}

// inspired by function format() of
// https://github.com/peggyjs/peggy/blob/main/lib/grammar-error.js
function error_snippet(location, input)
{
	let str = "";
	const s = location.start;
	const e = location.end;
	const lines = input.split(/\r\n|\n|\r/g);
	const line = lines[s.line - 1];
	const last = s.line === e.line ? e.column : line.length + 1;
	str += `${line}\n${"".padEnd(s.column - 1)}${"".padEnd(Math.max(1, last - s.column), "^")}`;

	return str;
}

function throwsToNotation(thr0ws)
{
	return thr0ws.map(thr0w => '' + thr0w.duration + (thr0w.p ? 'p' : '') + (thr0w.x ? 'x' : '')).join('');
}

function astToNotation(ast)
{
	switch (ast.type) {
		case 'passing':
			return '<' + ast.beats.map(soloBeats => astToNotation({type:'solo', beats:soloBeats})).join('|') + '>' + (ast.star ? '*' : '');

		case 'solo':
			return ast.beats.map(beat => astToNotation(beat)).join('') + (ast.star ? '*' : '');

		case 'sync':
			return '(' + astToNotation(ast.left)
				 + ',' + astToNotation(ast.right) + ')' + (ast.short ? '!' : '');

		case 'async':
			let out = ast.throws.map(
					thr0w => ''
					+ thr0w.duration
					+ (thr0w.p ? 'p' : '')
					+ (thr0w.x ? 'x' : '')
				).join('');

			if (ast.throws.length > 1)
				out = '[' + out + ']';
			return out;

		default:
			throw new Error(`unknown ast type ${ast.type}`);
	}
}



export default class ExtendedSiteswap {

// TODO: less hacky export?
static parser = parser;
static error_snippet = error_snippet;
static astToNotation = astToNotation;
static beatsToThrows = beatsToThrows;

/**
 *  constructs a new extended siteswap
 *  params:
 *  - input: can be one of:
 *     - a plain string with a pattern according to the grammar above
 *     - an array of strings with solo patterns according to the grammar above
 *     - an ast
 *  - options: object with the following optional keys:
 *     - jugglers/limbs/props according to the JIF specification
 *     - name: pattern name
 *
 */
constructor(input, options = {})
{
	this._valid = false;
	this.nProps = NaN;

	if (typeof input === 'string') {
		this.notation = input; // in case we can't parse it
		try {
			this.ast = parser.parse(input);
		} catch (e) {
			if (e.location)
				e.snippet = error_snippet(e.location, input);
			this.error = e;
		}
	} else if (Array.isArray(input)) {
		const errors = [];
		let passing = input;;

		this.notation = passing.length == 1 ? passing[0] : '<' + passing.join('|') + '>'; // in case we can't parse it

		const beats = [];
		const stars = [];
		passing.forEach((solo, j) => {
			try {
				const soloAst = parser.parse(solo);
				if (soloAst.type == 'solo') {
					beats.push(soloAst.beats);
					stars.push(soloAst.star);
				} else {
					errors.push(`siteswap for juggler ${j} is no solo siteswap`);
				}
			} catch (e) {
				if (e.location)
					e.snippet = error_snippet(e.location, solo);
				errors.push(e);
			}
		});
		const star = stars.every((x) => x);
		if (!star && stars.some((x) => x)) {
			beats.forEach((soloBeats, i) => {
				if (stars[i]) {
					soloBeats.forEach((beat) => {
						soloBeats.push(beat.type == 'sync' ?
							Object.assign({}, beat, {left:beat.right, right:beat.left})
							: beat
						);
					});

				}
			});
		}
		this.ast = passing.length == 1 ? {
			type: 'solo',
			beats: beats[0],
			star,
		} : {
			type: 'passing',
			beats,
			star,
		};
		if (errors.length)
			this.error = errors.join('\n');
	} else if (typeof input === 'object' && (input.type == 'solo' || input.type == 'passing')) {
		this.ast = input;
	}
	if (!this.error) {
		this.notation = astToNotation(this.ast);
		this.isVanillaSiteswap = ExtendedSiteswap.isVanillaSiteswap(this.notation);
	}

	// NOTE second try/catch needed as we still get a basic jif if we had an error above
	try {
		this.jif = this.toJif(options);
	} catch (e) {
		this.error = e;
	}

	if (!this.error && this.jif) {
		try {
			this.completeJif = Jif.complete(this.jif, { expand:true, props:true }).jif;
		} catch (e) {
			this.error = e;
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

toUrlSuffix()
{
	if (this.urlSuffix)
		return this.urlSuffix;
	return ExtendedSiteswap.stringToUrl(this.notation);
}

toUrl()
{
	return '/extended-siteswap/' + this.toUrlSuffix(); // TODO proper url encoding!
}

toJif(options = {})
{
	const pattern = this.toString();

	const jif = {
		meta: {
			name: options.name ? options.name : 'extended siteswap ' + pattern,
			generator: 'passist', // TODO: put version of package.json here again
		},
		highLevelDescription: {
			type: 'extendedSiteswap',
			description: pattern,
		},
		jugglers: options.jugglers,
		limbs:    options.limbs,
		props:    options.props,
	};

	let nLimbs = 2;

	const ast = this.ast;

	let throws = [];
	let period;
	if (ast.type == 'solo') {
		({ throws, time: period } = beatsToThrows(ast.beats));
	} else { // ast.type == 'passing'
		let time = 0;
		const nJugglers = ast.beats.length;
		nLimbs = nJugglers * 2;
		this.nLimbs = nLimbs;

		const beats = ast.beats;

		const byJuggler = beats.map(
			(beats, juggler) =>
				beatsToThrows(
					beats, {
						nLimbs,
						from: juggler * 2,
					}
				)
		);
		const passingTime = byJuggler[0].time;
		if (!byJuggler.every(x => x.time == passingTime))
			throw new Error("passing must have the same number of beats for every juggler");

		byJuggler.forEach(({ throws:jugglerThrows }, juggler) => {
			throws.push(...jugglerThrows);
		});

		period = passingTime;
	}

	const repetition = { period };

	if (ast.star || (period & 1))
		repetition.limbPermutation = [...Array(nLimbs).keys()].map(limb => limb ^ 1);

	jif.limbs = [];
	for (let i = 0; i < nLimbs; i++) {
		jif.limbs.push({
			juggler: Math.floor(i / 2),
			type: ((i & 1) ? 'left' : 'right') + ' hand',
		});
	}

	jif.throws = throws;
	jif.repetition = repetition;

	return jif;
}

nJugglers()
{
	if (this.ast && this.ast.passings)
		return this.ast.passings[0].length
	return 1;
}

static isVanillaSiteswap(notation)
{
	return !!notation.match(/^[\s0-9a-z]+$/i);
}

static stringToUrl(s)
{
	return s.replace(/^<(.*)>$/, '$1').split('|').map(encodeUrlPathPart).join('/');
}

}
