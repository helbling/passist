import Siteswap from "./siteswap.mjs";
import ExtendedSiteswap from "./extended_siteswap.mjs";

const patterns = [];

// 2 person vanilla siteswaps list from Christian Kästner
// https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt
const kaestnersKnownSiteswaps = [
	["645", "killer bunny"],
	["744", "5 club one count"],
	["726", "5 club one count"],
	["726", "coconut laden swallow"],
	["942", "glass elevator"],
	["867", "French 3 count"],
	["966", "7 club three count"],
	["756", "baby dragon; zap opus 1; holy hand-grenade"],
	["945", "dragon; black beast of aaaarg..."],
	["996", "8 club pps"],
	["7", "7 club one count"],
	["9", "9 club one count"],
	["975", "Holy Grail; zap opus two"],
	["64645", "zap intro"],
	["86227", "5 club why not"],
	["86722", "5 club not why"],
	["86867", "5 count popcorn (44)"],
	["77772", "Martin's one count (async)"],
	["77722", "parsnip"],
	["77222", "inverted parsnip"],
	["7746666", "Jim's 3 count (async)"],
	["77466", "Jim's 2 count (async)"],
	["774", "Jim's 1 count (async)"],
	["7777266", "Mild Madness (async)"],
	["77862", "why not"],
	["77286", "not why"],
	["78672", "maybe"],
	["96672", "not likely"],
	["79662", "maybe not"],
	["77786", "Funky Bookends"],
	["7a666", "5 count popcorn"],
	["966a666", "7 count popcorn (variation)"],
	["9668686", "7 count popcorn (variation)"],
	["7a66686", "7 count popcorn (variation)"],
	["786a666", "7 count popcorn (variation)"],
	["7868686", "7 count popcorn"],
	["9669964", "7 club Jim's 2 count"],
	["9968926", "7 club why not"],
	["9788926", "7 club why not (variation)"],
	["9689962", "7 club not why"],
	["9689782", "7 club not why (variation)"],
	["7889962", "7 club not why (variation)"],
	["7889782", "7 club not why (variation)"],
	["9969268", "7 club maybe (1)"],
	["9968296", "7 club maybe (2)"],
	["9968278", "7 club maybe (variation)"],
	["9669968926", "why rei"],
	["9964786", "7 club Jim's 2 count (variation)"],
	["9784966", "7 club Jim's 2 count (variation)"],
	["9784786", "7 club Jim's 2 count (variation)"],
	["b64", "Odd Scots"],
	["726778827", "Self Centered"],
	["7747746677466", "Jim's ppsps (async)"],
	["8686777", "Vitoria"],
	["7742744", "Flipalot"],
	["7747746677466", "Brainstorming / Jim's pssps (async)"],
	["9969788", "Poem"],
	["9968978", "Clean Finish"],
	["9968897", "Real Fake Clean Finish"],
	["75724", "Kaatzi"],
	["8897926", "Good Morning"],
	["7966966", "Good Night"],
	["89742", "The One to Concentrate"],
	["9789788", "Milk Duds"],
	["9647772", "Odnom"],
	["a2747", "a77 Warmup Pattern"],
	["9797888", "8 Club Vitoria"],
	["7966786", "Aspirin"],
	["7966966", "Placebo"],
	["996882777", "Grosses Chaos"],
	["5888222", "Heffalot"],
	["9522458", "5 club pattern you cannot do #1"],
	["5726258", "5 club pattern you cannot do #2"],
	["97522", "Dragonfly"],
	["8672255", "Uwe Pattern"],
	["9794884", "James' special day"],
	["b7575", "Ark of the Covenant"],
	["d757575", "Temple of Doom"],
	["95524", "Dragon cat"],
	["64555", "Funky magazine rack"],
	["966777777", "Double BANANA"],
	["94949", "Erdnussflips"],
];

var siteswapNames = {}
for (const [notation, name] of kaestnersKnownSiteswaps) {
	const siteswap = new Siteswap(notation);
	siteswapNames['2|' + siteswap.canonicString()] = name;
	patterns.push({
		nJugglers: 2,
		nProps: siteswap.nProps,
		type: 'vanilla_siteswap',
		notation,
		name,
		source: 'known_siteswaps',
		url: '/siteswap/' + notation + '?jugglers=2'
	});
}

// 2 person extended siteswaps
const syncPassings = [
	['<3p|3p>', 'one-count'],
	['<(3p,3p)!|(0,0)!><(0,0)!|(3p,3p)!>', 'synchronous one-count'],
	['<3p3|3p3>', 'two-count'],
	['<3p33|3p33>', 'three-count'],
	['<3p33|234p>', 'three-count vs early double'],
	['<3p333|3p333>', 'four-count'],
	['<3p333 3p33 3p3 3p 3p3 3p33|3p333 3p33 3p3 3p 3p3 3p33>', 'count-down'],
	['<(3p,4)(4, 3p)|(0,0)!(3px,4)(4,3px)!>', 'Scratch your head'],

	// TODO: make the following patterns use singles..
	['<4p|4p>', 'double treff'],
	['<(4x,4px)|(4x,4px)>', '8 club two count sync with doubles'],
	['<(4x,4px)|(4x,4px)>*', 'swinging door with doubles'],
];

for (const [input, name] of syncPassings) {
	const extendedSiteswap = new ExtendedSiteswap(input);
	const notation = extendedSiteswap.notation;
	siteswapNames['2|' + notation] = name;
	patterns.push({
		nJugglers: 2,
		nProps: extendedSiteswap.nProps(),
		type: 'extended_siteswap',
		notation,
		name,
		url: extendedSiteswap.toUrl(),
	});
}

export { patterns, siteswapNames };
