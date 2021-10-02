import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Siteswap from '../src/lib/siteswap.mjs';

function gen(params, expected) {
	const result = Array.from(
		Siteswap.generate(params)
	).filter((s) => s !== undefined);

	test(JSON.stringify(params), () => {
		assert.equal(result, expected);
	});
}

// passing, 2 jugglers
let params = {
	nProps:    7,
	minThrow:  2,
	maxThrow:  10,
	include:   "",
	exclude:   "3 5",
	nJugglers: 2
};

gen(Object.assign({}, params, { period: 1}), ['7']);

gen(Object.assign({}, params, { period: 3}),
	[ '867', '948', '966', 'a29', 'a47', 'a74' ]);

gen(Object.assign({}, params, { period: 4}),
	[ "8677", "9667", "9748", "9784", "9928", "9964", "a279", "a774", "a792"]);

gen(Object.assign({}, params, { period: 5}),
	[
		'86777', '86867', '88847', '92888', '94688', '96677', '96686', '96884',
		'97478', '97496', '97847', '97892', '97928', '97946', '99494', '99647',
		'99692', '99944', 'a2788', 'a2797', 'a2968', 'a6289', 'a6469', 'a6667',
		'a6784', 'a67a2', 'a6964', 'a7288', 'a7297', 'a7468', 'a7747', 'a7792',
		'a7a62', 'a8449', 'a8494', 'a8647', 'a8692', 'a8944', 'aa249', 'aa294', 'aa744'
	]);


// solo
params = {
	nProps:    3,
	minThrow:  1,
	maxThrow:  5,
	include:   "",
	exclude:   "",
	nJugglers: 1
};

gen(Object.assign({}, params, { period: 2}),
	[ "42", "51" ]);

gen(Object.assign({}, params, { period: 3}),
	[
		"423",
		"441",
		"522",
		"531",
	]);

gen(Object.assign({}, params, { period: 4}),
	[
		"4233",
		"4413",
		"5124",
		"5223",
		"5241",
		"5313",
		"5511",
	]);

gen(Object.assign({}, params, { period: 5}),
	[
		"42333",
		"42423",
		"44133",
		"44142",
		"51234",
		"51414",
		"52233",
		"52242",
		"52413",
		"52512",
		"53133",
		"53142",
		"55113",
	]);

test.run();

