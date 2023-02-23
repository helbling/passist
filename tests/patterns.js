import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Siteswap from '../src/lib/siteswap.mjs';
import SymmetricSiteswap from '../src/lib/symmetric_siteswap.mjs';
import ExtendedSiteswap from '../src/lib/extended_siteswap.mjs';
import { patterns } from '../src/lib/patterns.mjs';


for (const pattern of patterns) {
	const { url, type, notation, nJugglers, nProps }  = pattern;
	let siteswap;
	if (type == 'vanilla_siteswap')
		siteswap = new Siteswap(notation);
	else if (type == 'symmetric_siteswap')
		siteswap = new SymmetricSiteswap(notation, { nJugglers });
	else if (type == 'extended_siteswap')
		siteswap = new ExtendedSiteswap(notation);
	else {
		assert.ok(false, `unknown type ${type} in pattern ` + JSON.stringify(pattern));
		continue;
	}

	test(url + ' validity', () => { assert.ok(siteswap.isValid()); });
	test(url + ' nProps',   () => { assert.is(siteswap.nProps, nProps); });
}

test.run();
