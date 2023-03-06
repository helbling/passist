import { test } from 'uvu';
import * as assert from 'uvu/assert';
import SymmetricSiteswap from '../src/lib/symmetric_siteswap.mjs';
import * as fs from 'fs';

function patternValid(symmetricSiteswap, options, jif, warnings = []) {
	test(symmetricSiteswap.input + ' expecting valid', () => {
		assert.ok(symmetricSiteswap.isValid());
	});
}

// TODO: test more than two jugglers
const patternTests = [
	// invalid:
	{ input: '543',      valid: false },
	{ input: '543p',     valid: false },
	{ input: '<3p|3p>',  valid: false },

	// In phase patterns
	{ input: '3',                    valid: true },
	{ input: '3p',                   valid: true },
	{ input: '3p3',                  valid: true },
	{ input: '534',                  valid: true },
	{ input: '5 3p 4',               valid: true },
	{ input: '5p 3p 4p',             valid: true },
	{ input: '(3p, 3p)',             valid: true },
	{ input: '(4x, 4px)',            valid: true },
	{ input: '(4x, 4px)*',           valid: true },
	{ input: '(4,2)(2x,[44x])',      valid: true },
	{ input: '(4p,2)(2x,[44x])',     valid: true },
	{ input: '(4,2p)(2x,[44x])',     valid: true },
	{ input: '(4,2)(2px,[44x])',     valid: true },
	{ input: '(4,2)(2x,[4p4x])',     valid: true },
	{ input: '(4,2)(2x,[44px])',     valid: true },
	{ input: '(4p,2p)(2px,[4p4px])', valid: true },


	// In phase patterns straight/cross flipped
	{ input: '3px',                  valid: true },
	{ input: '3px3',                 valid: true },
	{ input: '5px 3px 4px',          valid: true },
	{ input: '(3px, 3px)',           valid: true },
	{ input: '(4px,2)(2p,[44p])',    valid: true },


	// Out of phase patterns - aka Prechac
	{ input: '4px 3',                valid: true }, // two-count with 7
	{ input: '4p 3',                 valid: true },
	{ input: '4p 2 2 2',             valid: true },
	{ input: '4p 1 1 1 1 1',         valid: true },
	{ input: '534px333',             valid: true }, // six-count popcorn
	{ input: '2.5p',                 valid: true }, // 5 clubs ultimates
	{ input: '3.5p',                 valid: true }, // 7 clubs ultimates
	{ input: '4.5p',                 valid: true }, // 9 clubs ultimates
	{ input: '3.5p 3 3.5p 4 1',      valid: true }, // why not
	{ input: '3.5p 4.5p 5.5p',       valid: true },
	{ input: '3.5p 3 4',             valid: true }, // french three-count
	{ input: '3p 3p 3p 1',           valid: true },
	{ input: '5 5 5 1 3p 3 3 3',     valid: true },

	// Another category of out of phase patterns (not Prechac)
	// { input: '(3, 3p)! 3 *',         valid: true }, // techno
	// { input: '(4, 3p)*',             valid: true }, // scratch your head

	// 3 jugglers
	{ nJugglers:3, input: '3.3p',      valid: true },
	{ nJugglers:3, input: '3.7p 3',    valid: true },
	{ nJugglers:3, input: '4p 3 3',    valid: true },
	{ nJugglers:3, input: '3p 3 4',    valid: true },
	{ nJugglers:3, input: '3p 4p 5p',  valid: true },
	{ nJugglers:3, input: '3p 3 5p',   valid: true },
	{ nJugglers:3, input: '4p 3 4 2 3 4',   valid: true },
	{ nJugglers:3, input: '4p 5p 6p 2 3 4', valid: true },

	{ nJugglers:3, input: '3.3px',        valid: true },
	{ nJugglers:3, input: '3.7px 3',      valid: true },
	{ nJugglers:3, input: '3px 3 4',      valid: true },
	{ nJugglers:3, input: '4px 3 3',      valid: true },
	{ nJugglers:3, input: '3px 4px 5px',  valid: true },
	{ nJugglers:3, input: '3px 3 5px',    valid: true },
	{ nJugglers:3, input: '4px 3 4 2 3 4',     valid: true },
	{ nJugglers:3, input: '4px 5px 6px 2 3 4', valid: true },

];

for (const patternTest of patternTests) {
	const input = patternTest.input;
	const options = {};
	if (patternTest.nJugglers)
		options.jugglers = Array.from(Array(patternTest.nJugglers), () => ({}));
	const testname = input + ' (' + (patternTest.nJugglers ?? 2) + ' jugglers)';
	const symmetricSiteswap = new SymmetricSiteswap(input, options);

	test(testname + ' validity', () => {
		assert.is(symmetricSiteswap.isValid(), patternTest.valid);
	});

	// TODO: test nProps
	// TODO: test url
	// TODO: test alternative notations
	// TODO: test if causal diagram works without errors on all valid patterns
}

test.run();

