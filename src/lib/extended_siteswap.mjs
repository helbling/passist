'use strict';

import peg from 'pegjs';

const grammar = `
  // jugglinglab pattern grammar for pegjs
  // =====================================
  //
  // see https://jugglinglab.org/html/ssnotation.html

  Pattern
	= _ beats:( Beat / Passing )+ _ { return beats; }

  Passing
    = "<" _ head:Beat tail:( _ "|" _ Beat )* _ ">" _ {
  	  return { passing: [head, ...tail.map(x => x[3])] };
      }

  Beat
    = Hand / Sync


  Sync
    = "(" _ left:Hand _ "," _ right:Hand _ ")" _ {
        return [ "sync", [right, left] ];
      }


  Hand
    = m:Multiplex { return ['hand', m[1]]; }
      / t:Throw   { return ['hand', [t]]; }

  Multiplex
    =   "[" _ t:Throw+ _ "]" _ { return ['multiplex', t]; }

  Throw
    = height:Height _ cross:Cross ? _ pass:Pass ? _ { return { height, pass, cross }; }

  Pass
    = "p" { return true }

  Cross
    = "x" { return true }

  Height "height"
    = _ char:[0-9a-o] { return (char.match(/[0-9]/) ? +char : (char.charCodeAt(0) - 'a'.charCodeAt(0) + 10)); }

  _ "whitespace"
    = [ \\t\\n\\r]*
`

var parser = peg.generate(grammar);


export default class ExtendedSiteswap {

constructor(input)
{
	this.input = input;
	try {
		this.ast = parser.parse(input);
		console.log(JSON.stringify(this.ast, null, 2));
	} catch (e) {
		this.error = e;
	}
}

isValid()
{
	return !this.error;
}

toString()
{
	return this.input;
}


toJif(options)
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

	if (!this.isValid())
		return jif;

// 	for (let i = 0; i < steps; i++) {
// 		const height = heights[i % this.period];
// 		const t = {
// 			time: i,
// 			duration: height,
// 			from: i % nLimbs,
// 			to:  (i + height) % nLimbs,
// 			label: Siteswap.heightToChar(height)
// 		};
// 		if (options.flipTwos && (height > 1.5 * jif.timeStretchFactor && height < 2.5 * jif.timeStretchFactor))
// 			t.spins = 1;
//
// 		throwsAtTime.push(t);
// 		jif.throws.push(t);
// 	}

	return jif;
}

}
