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

	// Out of phase patterns - aka Prechac
	{ input: '4p 3',                 valid: true }, // two-count with 7
	{ input: '534px333',             valid: true }, // six-count popcorn
	{ input: '3.5p 3 3.5p 4 1',      valid: true }, // why not
	{ input: '3.5p 3 4',             valid: true }, // french three-count

	// Another category of out of phase patterns (not Prechac)
	// { input: '(3, 3p)! 3 *',         valid: true }, // techno
	// { input: '(4, 3p)*',             valid: true }, // scratch your head
];

for (const patternTest of patternTests) {
	const input = patternTest.input;
	const symmetricSiteswap = new SymmetricSiteswap(input);

	test(input + ' validity', () => {
		assert.is(symmetricSiteswap.isValid(), patternTest.valid);
	});

	// TODO: test nProps
	// TODO: test url
	// TODO: test alternative notations
}

test.run();

