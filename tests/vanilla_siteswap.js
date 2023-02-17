import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Siteswap from '../src/lib/siteswap.mjs';
import { patterns } from '../src/lib/patterns.mjs'

for (const pattern of patterns) {
	if (pattern.type != 'vanilla_siteswap')
		continue;
	const notation = pattern.notation;
	const siteswap = new Siteswap(notation);

	test(notation + ' expecting valid siteswap', () => {
		assert.ok(siteswap.isValid());
	});
}

test.run();

