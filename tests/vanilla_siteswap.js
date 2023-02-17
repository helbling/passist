import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Siteswap from '../src/lib/siteswap.mjs';
import Jif from '../src/lib/jif.mjs';
import { patterns } from '../src/lib/patterns.mjs'

function defaultLimbs(n) // TODO: avoid copy-pasta
{
	const result = [];
	for (let i = 0; i < 2 * n; i++) {
		const juggler = i % n;

		// alternating right and left for an odd number of jugglers makes the patterns more symmetric (Co Stuifbergen)
		const right = (n % 2) ? !(i % 2) : i < n;
		result.push({
			juggler,
			type: (right ? 'right' : 'left') + ' hand',
		});
	}
	return result;
}

for (const pattern of patterns) {
	if (pattern.type != 'vanilla_siteswap')
		continue;
	const notation = pattern.notation;
	const siteswap = new Siteswap(notation);

	test(notation + ' expecting valid siteswap', () => {
		assert.ok(siteswap.isValid());
	});

	for (let nJugglers = 1; nJugglers <= 3; nJugglers++) {
		const jugglers = [];
		for (let i = 0; i < nJugglers; i++)
			jugglers.push({ name: String.fromCharCode(65 + i)});

		let exception = false;
		try {
			const jif = siteswap.toJif({
				jugglers,
				limbs: defaultLimbs(nJugglers),
			});
			Jif.complete(jif, { expand:true, props:true });
		} catch(e) {
			console.log(notation, e);
			exception = true;
		}

		test(notation + ` no exception when generating jif for ${nJugglers} jugglers`, () => {
			assert.ok(!exception);
		});
	}
}

test.run();

