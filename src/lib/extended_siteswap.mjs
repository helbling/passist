'use strict';

import peggy from 'peggy';
import Siteswap from './siteswap.mjs';
import Jif from './jif.mjs';

const grammar = `
  // jugglinglab pattern grammar for peggy
  // =====================================
  //
  // see https://jugglinglab.org/html/ssnotation.html

  Pattern
    = _ beats:Solo+       _ star:Star? _ { return { type:"solo",    star, beats    }; }
    / _ passings:Passing+ _ star:Star? _ { return { type:"passing", star, passings }; }

  Star
    = "*" { return true }

  Passing
    = "<" _ head:Solo+ tail:( _ "|" _ Solo+ )* _ ">" _ {
        return [head, ...tail.map(x => x[3])];
      }

  Solo
    = Async / Sync

  Async
    = _ m:Multiplex _ _ {
        return { type:"async", throws:m };
      }

  Sync
    = _ "(" _ left:Multiplex _ "," _ right:Multiplex _ ")" short:"!"? _ {
        return { type:"sync", left, right, short:!!short };
      }

  Multiplex
    =  _ "[" _ t:Throw+ _ "]" _ { return  t; }
    /  _ t:Throw                { return [t]; }

  Throw
    = duration:Duration _ x:X _ p:P     _ { return { duration, p, x }; }
    / duration:Duration _ p:P _ x:X     _ { return { duration, p, x }; }
	/ duration:Duration _ p:P ? _ x:X ? _ { return { duration, p, x }; }

  P
    = "p" { return true }

  X
    = "x" { return true }

  Duration "duration"
    = _ char:[0-9a-o] { return (char.match(/[0-9]/) ? +char : (char.charCodeAt(0) - 'a'.charCodeAt(0) + 10)); }

  _ "whitespace"
    = [ \\t\\n\\r]*
`

var parser = peggy.generate(grammar);

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

function beats2throws(beats, {nLimbs = 2, from = 0, time = 0 } = {})
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
			for (const t of beat.left)
				throws.push(addTo({
					time,
					duration: t.duration,
					from: from | 1,
					label: label(t),
				}, t, nLimbs));

			for (const t of beat.right)
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
	return { throws, time };
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



export default class ExtendedSiteswap {

constructor(input, options = {})
{
	this.input = input;
	try {
		this.ast = parser.parse(input);
	} catch (e) {
		if (e.location)
			e.snippet = error_snippet(e.location, input);
		this.error = e;
	}

	// NOTE second try/catch needed as we still get a basic jif if we had an error above
	try {
		this.jif = this.toJif(options);
	} catch (e) {
		this.error = e;
	}
	this.isVanillaSiteswap = ExtendedSiteswap.isVanillaSiteswap(input);
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
	return this.input;
}


toJif(options = {})
{
	const pattern = this.toString();

	const jif = {
		meta: {
			name: options.name ? options.name : 'extended siteswap ' + pattern,
			generator: options.generator,
		},
		highLevelDescription: {
			type: 'extendedSiteswap',
			description: pattern,
		},
		jugglers: options.jugglers,
		limbs:    options.limbs,
		props:    options.props,
	};

	if (this.error)
		return jif;

	let nLimbs = 2;

	const ast = this.ast;

	let throws = [];
	let period;
	if (ast.type == 'solo') {
		({ throws, time: period } = beats2throws(ast.beats));
	} else { // ast.type == 'passing'
		let time = 0;
		const nJugglers = ast.passings[0].length;
		nLimbs = nJugglers * 2;

		this.nJugglers = nJugglers;
		this.nLimbs = nLimbs;

		for (const passing of ast.passings) {
			if (passing.length != nJugglers)
				throw new Error("passing must always have the same number of jugglers");

			const byJuggler = passing.map(
				(passing, juggler) =>
					beats2throws(
						passing, {
							nLimbs,
							from: juggler * 2 + (time & 1),
							time,
						}
					)
			);
			const passingTime = byJuggler[0].time;
			if (!byJuggler.every(x => x.time == passingTime))
				throw new Error("passing must have the same number of beats for every juggler");

			byJuggler.forEach(({ throws:jugglerThrows }, juggler) => {
				throws.push(...jugglerThrows);
			});

			time = passingTime;
		}
		period = time;
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

nProps() {
	if (!this.isValid())
		return NaN;

	return this.completeJif.props.length;
}

static isVanillaSiteswap(input) {
	return !!input.match(/^[\s0-9a-z]+$/i);
}

static stringToUrl(s) {
	// TODO: properly handle things like
	// <(3p,3p)!|(0,0)!><(0,0)!|(3p,3p)!>
	return s.replace(/^<(.*)>$/, '$1').replaceAll('|', '/');
}

}
