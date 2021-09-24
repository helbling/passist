'use strict';

export default class Siteswap {

constructor(input)
{
	if (Array.isArray(input))
		this.heights = input.slice(); // clone
	else
		this.heights = String(input).split('').map(function(x) {
			return x.match(/[0-9]/) ? +x : (x == '_' ? -1 : (x.charCodeAt(0) - 'a'.charCodeAt(0) + 10));
		});
	this.period = this.heights.length;
	this.nProps = this.period > 0 ? this.heights.reduce(function(a, b) { return a + b; }, 0) / this.period : 0;
}

static heightToChar(x)
{
	x = +x;
	return x < 0 ? '_' : (x <= 9 ? String(x) : String.fromCharCode('a'.charCodeAt(0) + x - 10));
}

static heightsToString(heights)
{
	return heights.map(Siteswap.heightToChar).join('');
}

isValid()
{
	const landing = new Array(this.period);
	let valid = true;
	this.heights.forEach(function(v, k) {
		const pos = (k + v) % this.period;
		if (landing[pos])
			valid = false;
		landing[pos] = true;
	}.bind(this));
	return this.period > 0 ? valid : undefined;
}

toString()
{
	return Siteswap.heightsToString(this.heights);
}

shift(times)
{
	if (typeof times === "undefined")
		times = 1;
	times = ((times % this.period)+ this.period) % this.period; // assert 0 <= times < this.period
	const heights = this.heights.slice(0); // clone
	for (; times > 0; times--) {
		const first = heights.shift();
		heights.push(first);
	}
	return new Siteswap(heights);
}


allShifts()
{
	const shifts = [];
	for (let i = 0; i < this.period; i++)
		shifts.push(new Siteswap(this.heights.slice(i).concat(this.heights.slice(0, i))));
	return shifts;
}

canonicString()
{
	return this.allShifts().map(function(s) { return s.toString();}).sort()[this.period - 1];
}

getStartProperties(nJugglers)
{
	const rethrowsByHand = Array.apply(null, Array(nJugglers * 2)).map(function() {return 0;});
	let i = 0;
	const hasLanding = [];
	let isGroundState = 1;
	let squeezes = 0;
	for (let missing = this.nProps; missing > 0; i++) {
		const t = this.heights[i % this.period];
		if (t > 0) {
			var hand = i % (nJugglers * 2);
			if (hasLanding[i]) {
				rethrowsByHand[i % (nJugglers * 2)]++;
				isGroundState = 0;
			} else {
				squeezes += rethrowsByHand[hand];
				rethrowsByHand[hand] = 0;
				missing--;
			}
			hasLanding[i + t] = true;
		}
	}
	return {
		isGroundState: isGroundState,
		squeezes: squeezes,
	};
}

globalInterface(nJugglers)
{
	const result = new Array(this.period);
	for (const i in this.heights) {
		const t = this.heights[i];
		result[(+i + +t) % this.period] = (t % nJugglers) ? 'p' : 's';
	}
	return result.join('');
}

orbits()
{
	const visited = [];
	const result = [];
	for (let i = 0; i < this.period; i++) {
		if (visited[i] || this.heights[i] == 0)
			continue;

		const orbit = new Array(this.period).fill(0);
		for (let j = i; !visited[j]; j = ((j + this.heights[j]) % this.period)) {
			orbit[j] = this.heights[j];
			visited[j] = true;
		}
		result.push(orbit);
	}

	return result;
}

toJif(options)
{
	const nLimbs = options.limbs.length;
	const siteswap = this.toString();

	const jif = {
		jif: '0.01',
		meta: {
			name: options.name ? options.name : 'siteswap ' + siteswap,
			generator: options.generator,
		},
		highLevelDescription: {
			type: 'vanillaSiteswap',
			description: siteswap,
		},
		jugglers: options.jugglers,
		limbs:    options.limbs,
		props:    options.props,

		timeStretchFactor: nLimbs / 2,
	};

	const heights = this.heights;
	if (!this.isValid())
		return jif;

	function lcmArray(array) {
		function gcd(a, b) { return !b ? a : gcd(b, a % b); }
		function lcm(a, b) { return (a * b) / gcd(a, b); }
		let multiple = 1;
		array.forEach(function(n) {
			multiple = lcm(multiple, n);
		});
		return multiple;
	}
	const periods = this.orbits().map(function(orbit) {
		return orbit.reduce(function(a, b) { return a + b; }, 0); // sum
	});
	periods.push(nLimbs);

	const steps = lcmArray(periods);

	jif.period = steps;
	jif.throws = [];
	if (this.period < 1)
		return jif;

	const throwsAtTime = [];

	for (let i = 0; i < steps; i++) {
		const height = heights[i % this.period];
		const t = {
			time: i,
			duration: height,
			from: i % nLimbs,
			to:  (i + height) % nLimbs,
			label: Siteswap.heightToChar(height)
		};
		if (options.flipTwos && (height > 1.5 * jif.timeStretchFactor && height < 2.5 * jif.timeStretchFactor))
			t.spins = 1;

		throwsAtTime.push(t);
		jif.throws.push(t);
	}

	// label throws with propid
	let propid = 0;
	for (let i = 0; i < steps; i++) {
		const t = throwsAtTime[i];
		if (t.prop === undefined && t.duration) {
			let j = i;
			throwsAtTime[j].prop = propid;
			while (j < steps && throwsAtTime[j].duration) {
				j += throwsAtTime[j].duration;
				throwsAtTime[j % steps].prop = propid;
			}

			propid++;
		}
	}

	return jif;
}

startConfigurations(limbs)
{
	const period = this.period;
	const nLimbs = limbs.length;
	const nJugglers = Math.max(...limbs.map(limb => limb.juggler + 1));
	const startLimbs = Array.apply(null, Array(nLimbs)).map(function() {return 0;});
	let i = 0;
	const hasProp = [];
	for (var missing = this.nProps; missing > 0; i++) {
		const t = this.heights[i % period];
		if (t > 0) {
			if (!hasProp[i]) {
				startLimbs[i % nLimbs]++;
				missing--;
			}
			hasProp[i + t] = true;
		}
	}

	const result = new Array(nJugglers);
	const limbPatterns = [...Array(nJugglers).keys()].map(
		juggler => limbs.map(limb => limb.juggler == juggler)
	);
	const maxNLimbs = Math.max(...limbPatterns.map(p => p.filter(Boolean).length));

	for (let juggler = 0; juggler < nJugglers; juggler++) {
		const limbPattern = limbPatterns[juggler];
		const symmetric =
			nLimbs % 2 == 0
			&&     limbPattern.slice(0, nLimbs / 2).join(',')
			    == limbPattern.slice(nLimbs / 2   ).join(',');

		const localPeriods = period % nJugglers == 0 ? 1 : (symmetric ? nLimbs / 2 : nLimbs);
		const localThrows = [];
		let throwCount = 0;
		for (let i = 0; i < localPeriods; i++) {
			for (let j = 0; j < period; j++) {
				const limbId = (j + i * period) % nLimbs;
				if (limbPattern[limbId]) {
					const height = this.heights[j];
					localThrows.push({
						height,
						from: limbs[limbId],
						to:   limbs[(limbId + height) % nLimbs],
					});
					throwCount++;
				}
				if (limbId == nLimbs - 1) {
					while (throwCount < maxNLimbs) {
						localThrows.push(null);
						throwCount++;
					}
					throwCount = 0;
				}
			}
		}

		const name = function(i) {
			return String.fromCharCode('A'.charCodeAt(0) + i);
		};
		result[juggler] = {
			local: localThrows.map(th => {
				if (!th)
					return null;
				let desc = '';
				if (th.from.juggler != th.to.juggler) {
					if (nJugglers > 2)
						desc += name(th.to.juggler);
					desc += th.from.type == th.to.type ? 'X' : '||';
					desc = '<sub>' + desc + '</sub>';
				}
				return {
					height: th.height,
					siteswap: Siteswap.heightToChar(th.height),
					desc: desc ? desc : '&nbsp;',
					unusual: (th.from.juggler != th.to.juggler) != (th.height % 2 == 1),
				};
			}),
			name:  name(juggler),
			startProps: {},
		};
	}
	for (let i = 0; i < nLimbs; i++) {
		const limb = limbs[i];
		result[limb.juggler].startProps[limb.type] = startLimbs[i];
	}
	return result;
}

/*
 * generate siteswaps
 * params:
 *  minThrow   minimal throw height
 *  maxThrow   maximal throw height
 *  nProps     number of props
 *  period     siteswap period
 *  nJugglers  number of jugglers
 *  include    regular expression the global siteswap must match
 *  exclude    regular expression the global siteswap must not match
 *  cloze      Siteswap with given fixed siteswap heights, -1 for dynamic
 */
static *generate(params)
{
	const min = Math.max(0, Math.min(35, parseInt(params.minThrow) || 0));
	const max = Math.max(0, Math.min(35, parseInt(params.maxThrow) || 0));
	const nProps = Math.max(0, Math.min(35, parseInt(params.nProps) || 0));
	const cloze = params.cloze;
	const period = cloze ? cloze.period : Math.max(1, Math.min(15, parseInt(params.period) || 0));
	const nJugglers = Math.max(1, Math.min(9, parseInt(params.nJugglers) || 0));

	function isCanonic(siteswap) {
		const shifts = [];
		for (let i = 0; i < period; i++)
			shifts.push(siteswap.slice(i) + siteswap.slice(0, i));
		return shifts.sort()[period - 1] == siteswap;
	}
	function getHeight(siteswap, i) {
		const x = siteswap.charCodeAt(i);
		if (x >= 48 && x <= 57)
			return x - 48;
		else if (x >= 97 && x <= 122)
			return x - 87;
		else
			throw "invalid character in siteswap: " + siteswap.charAt(i);
	}

	function filters(input) {
		const selfs = [];
		const passes = [];
		for (let i = min; i <= max; i++) {
			if (i % nJugglers)
				passes.push(i);
			else
				selfs.push(i);
		}
		input = input.trim().replace(/s/gi, '[' + selfs.join('') + ']').replace(/p/gi, '[' + passes.join('') + ']');
		return input ? input.split(/ /) : [];
	}
	const excludeFilters = filters(params.exclude || '');
	const includeFilters = filters(params.include || '');

	function exclude(str) {
		return excludeFilters.some(function(filter) { return (str + str + str).match(filter);});
	}
	function include(str) {
		return includeFilters.every(function(filter) { return (str + str + str).match(filter);});
	}

	const finalCheck = function(canonic) {
		// check if it is a smaller period which is repeated
		if (!cloze) {
			for (let p = 1; p < period; p++) {
				if (period % p == 0) {
					// splits canonic into period / i chunks of i characters
					// if all chunks are equal, we have found a smaller period p
					if (Array.apply(null, {length: period / p}).map(Function.call, Number).map(function (k) {
							return canonic.slice(p * k, p * (k + 1));
						}).every(function (val, i, arr) { return val === arr[0]; }))
							return false;
				}
			}
		}

		if (nJugglers > 1) {
			// TODO: check if there is at least one pass for every juggler (example: a56 for 3 jugglers makes C do only flips)

			let nPasses = 0;
			for (let i = 0; i < period; i++) {
				if (getHeight(canonic, i) % nJugglers)
					nPasses++;
			}
			// TODO: let user specify nPasses range
			if (nPasses == 0)
				return false;
		}

		// check constraints
		if (exclude(canonic) || !include(canonic))
			return false;

		return true;
	};

	const heights = new Array(period).fill(-1);
	const landing = new Array(period).fill(0);
	let sum = 0;
	let i = 0;
	let ops = 0;
	let toFill = period;

	if (cloze) {
		for (let [j, height] of Object.entries(cloze.heights)) {
			j = +j;
			height = +height;
			if (height >= 0) {
				heights[j] = height;
				if (landing[(j + height) % period]) {
					throw "invalid cloze!";
					return;
				}
				landing[(j + height) % period] = 1;
				sum += height;
				toFill--;
			}
		}
	}
	const skip = () => (cloze && i >= 0 && i < period && cloze.heights[i] >= 0);

	while (skip())
		i++;

	while (i >= 0) {
		ops += 1;
		if (ops % 1000 == 0)
			yield; // need to yield regularly so we have a chance to switch to the ui thread from time to time

		if (i == period) {
			const c = Siteswap.heightsToString(heights);
			if ((isCanonic(c) || cloze) && finalCheck(c))
				yield c;

			toFill++;
			do {
				i--;
			} while (skip());
		} else {
			const h = heights[i];
			if (h >= 0) {
				landing[(i + h) % period] = 0;
				sum -= h;
				heights[i]++;
			}

			let minT = Math.max(min, nProps * period - sum - (toFill - 1) * max);
			let maxT = Math.min(max, nProps * period - sum - (toFill - 1) * min);
			if (i > 1 && !cloze)
				maxT = Math.min(heights[0], maxT); // otherwise siteswap would not be canonic anymore

			if (h < 0)
				heights[i] = minT;

			while (heights[i] <= maxT + 1 && landing[(i + heights[i]) % period])
				heights[i]++;

			if (heights[i] > maxT) {
				heights[i] = -1;
				toFill++;
				do {
					i--;
				} while (skip());
				continue;
			}

			landing[(i + heights[i]) % period] = 1;
			sum += heights[i];

			toFill--;
			do {
				i++
			} while (skip());
		}
	}
}

}
