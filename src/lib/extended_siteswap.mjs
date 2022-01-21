'use strict';

import peg from 'pegjs';

const grammar = `
  // jugglinglab pattern grammar for pegjs
  // =====================================
  //
  // see https://jugglinglab.org/html/ssnotation.html

  Pattern
	= _ beats:Solo+    _ star:Star? _ { return { type:"solo", star, beats }; }
	/ _ beats:Passing+ _ star:Star? _ { return { type:"passing", star, beats }; }

  Star
    = "*" { return true }

  Passing
    = "<" _ head:Solo tail:( _ "|" _ Solo )* _ ">" _ {
  	  return { passing: [head, ...tail.map(x => x[3])] };
      }

  Solo
    = Async / Sync

  Async
    = _ m:Multiplex _ _ {
        return [ "async", m ];
      }

  Sync
    = _ "(" _ left:Multiplex _ "," _ right:Multiplex _ ")" _ {
        return [ "sync", [left, right] ];
      }

  Multiplex
    =  _ "[" _ t:Throw+ _ "]" _ { return  t; }
    /  _ t:Throw                { return [t]; }

  Throw
    = height:Height _ x:X _ p:P     _ { return { height, p, x }; }
    / height:Height _ p:P _ x:X     _ { return { height, p, x }; }
	/ height:Height _ p:P ? _ x:X ? _ { return { height, p, x }; }

  P "pass flag"
    = "p" { return true }

  X "x flag"
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
