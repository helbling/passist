import Siteswap from "./siteswap.mjs";
import ExtendedSiteswap from "./extended_siteswap.mjs";
import { encodeUrlPathPart } from './utils.mjs';

const patterns = [];

// 2 person vanilla siteswaps list from Christian Kästner
// https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt
const kaestnersKnownSiteswaps = [
	[5, "645", "killer bunny"],
	[5, "744", "5 club one count"],
	[5, "726", "5 club one count"],
	[5, "726", "coconut laden swallow"],
	[5, "942", "glass elevator"],
	[7, "867", "French 3 count"],
	[7, "966", "7 club three count"],
	[6, "756", "baby dragon; zap opus 1; holy hand-grenade"],
	[6, "945", "dragon; black beast of aaaarg..."],
	[8, "996", "8 club pps"],
	[7, "7", "7 club one count"],
	[9, "9", "9 club one count"],
	[7, "975", "Holy Grail; zap opus two"],
	[5, "64645", "zap intro"],
	[5, "86227", "5 club why not"],
	[5, "86722", "5 club not why"],
	[7, "86867", "5 count popcorn (44)"],
	[6, "77772", "Martin's one count (async)"],
	[5, "77722", "parsnip"],
	[4, "77222", "inverted parsnip"],
	[6, "7746666", "Jim's 3 count (async)"],
	[6, "77466", "Jim's 2 count (async)"],
	[6, "774", "Jim's 1 count (async)"],
	[6, "7777266", "Mild Madness (async)"],
	[6, "77862", "why not"],
	[6, "77286", "not why"],
	[6, "78672", "maybe"],
	[6, "96672", "not likely"],
	[6, "79662", "maybe not"],
	[7, "77786", "Funky Bookends"],
	[7, "7a666", "5 count popcorn"],
	[7, "966a666", "7 count popcorn (variation)"],
	[7, "9668686", "7 count popcorn (variation)"],
	[7, "7a66686", "7 count popcorn (variation)"],
	[7, "786a666", "7 count popcorn (variation)"],
	[7, "7868686", "7 count popcorn"],
	[7, "9669964", "7 club Jim's 2 count"],
	[7, "9968926", "7 club why not"],
	[7, "9788926", "7 club why not (variation)"],
	[7, "9689962", "7 club not why"],
	[7, "9689782", "7 club not why (variation)"],
	[7, "7889962", "7 club not why (variation)"],
	[7, "7889782", "7 club not why (variation)"],
	[7, "9969268", "7 club maybe (1)"],
	[7, "9968296", "7 club maybe (2)"],
	[7, "9968278", "7 club maybe (variation)"],
	[7, "9669968926", "why rei"],
	[7, "9964786", "7 club Jim's 2 count (variation)"],
	[7, "9784966", "7 club Jim's 2 count (variation)"],
	[7, "9784786", "7 club Jim's 2 count (variation)"],
	[7, "b64", "Odd Scots"],
	[6, "726778827", "Self Centered"],
	[6, "7747746677466", "Jim's ppsps (async)"],
	[7, "8686777", "Vitoria"],
	[5, "7742744", "Flipalot"],
	[6, "7747746677466", "Brainstorming / Jim's pssps (async)"],
	[8, "9969788", "Poem"],
	[8, "9968978", "Clean Finish"],
	[8, "9968897", "Real Fake Clean Finish"],
	[5, "75724", "Kaatzi"],
	[7, "8897926", "Good Morning"],
	[7, "7966966", "Good Night"],
	[6, "89742", "The One to Concentrate"],
	[8, "9789788", "Milk Duds"],
	[6, "9647772", "Odnom"],
	[6, "a2747", "a77 Warmup Pattern"],
	[8, "9797888", "8 Club Vitoria"],
	[7, "7966786", "Aspirin"],
	[7, "7966966", "Placebo"],
	[7, "996882777", "Grosses Chaos"],
	[5, "5888222", "Heffalot"],
	[5, "9522458", "5 club pattern you cannot do #1"],
	[5, "5726258", "5 club pattern you cannot do #2"],
	[5, "97522", "Dragonfly"],
	[5, "8672255", "Uwe Pattern"],
	[7, "9794884", "James' special day"],
	[7, "b7575", "Ark of the Covenant"],
	[7, "d757575", "Temple of Doom"],
	[5, "95524", "Dragon cat"],
	[5, "64555", "Funky magazine rack"],
	[7, "966777777", "Double BANANA"],
	[7, "94949", "Erdnussflips"],
];

var siteswapNames = {}
for (const [nProps, notation, name] of kaestnersKnownSiteswaps) {
	const url = '/siteswap/' + notation + '?jugglers=2';
	for (let i = 0; i < notation.length; i++)
		siteswapNames['/siteswap/' + notation.slice(i) + notation.slice(0, i) + '?jugglers=2'] = name;
	patterns.push({
		nJugglers: 2,
		nProps,
		type: 'vanilla_siteswap',
		notation,
		name,
		source: 'known_siteswaps',
		url,
	});
}

// 2 person symmetric siteswaps
const symmetricPassings = [
	[6, '3p',         'one-count'],
	[6, '(3p,3p)',    'synchronous one-count'],
	[6, '3p3',        'two-count'],
	[6, '3p33',       'three-count'],
	[6, '3p333',      'four-count'],
	[6, '3p333 3p33 3p3 3p 3p3 3p33', 'count-down'],
	[7, '4px3',       '7 prop two-count'],
	[7, '5p333',      '7 prop four-count'],
	[7, '534px333',   'six-count popcorn'],
	[8, '554px4px33', '8 prop popcorn'],
	[9, '(4px,4x)(6x,4x)', 'Good Twin'],
	[9, '(6px,4x)(4,4)', 'Evil Twin'],
	[9, '(6x,4x)(5p,4x)(4,4)', 'Unpopped Popcorn'],
	[10, '5p',        '10 prop one-count'],


	// TODO: make the following patterns use singles..
	[8, '4p',        'double treff'],
	[8, '(4x,4px)',  '8 prop two count symmetric with doubles'],
	[8, '(4x,4px)*', 'swinging door with doubles'],
];

for (const [nProps, notation, name] of symmetricPassings) {
	const url = '/symmetric-siteswap/' + encodeUrlPathPart(notation) + '?jugglers=2';
	siteswapNames[url] = name;
	patterns.push({
		nJugglers: 2,
		nProps,
		type: 'symmetric_siteswap',
		notation,
		name,
		url,
	});
}

// 2 person synchronous siteswaps
const extendedPassings = [
	[6, '<3p33|234p>',                          'three-count vs early double'],
	[7, '<(3p,4)(4,3p)|(0,0)!(3px,4)(4,3px)!>', 'Scratch your head'], // TODO: can this be turne into a sync pattern?
];

for (const [nProps, notation, name] of extendedPassings) {
	const url = '/extended-siteswap/' + ExtendedSiteswap.stringToUrl(notation);
	siteswapNames[url] = name;
	patterns.push({
		nJugglers: 2,
		nProps,
		type: 'extended_siteswap',
		notation,
		name,
		url,
	});
}

export { patterns, siteswapNames };
