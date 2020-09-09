'use strict';

export default class Siteswap {

constructor(input)
{
	if (Array.isArray(input))
		this.heights = input;
	else
		this.heights = String(input).split('').map(function(x) {
			return x.match(/[0-9]/) ? +x : x.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
		});
	this.period = this.heights.length;
	this.nProps = this.period > 0 ? this.heights.reduce(function(a, b) { return a + b; }, 0) / this.period : 0;
}

static heightToChar(x)
{
	x = +x;
	return x <= 9 ? String(x) : String.fromCharCode('a'.charCodeAt(0) + x - 10);
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
		startsWithPass: this.heights[0] % nJugglers ? 1 : 0
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
	for (let i = 0; i < this.heights.length; i++) {
		if (visited[i] || this.heights[i] == 0)
			continue;

		const orbit = [];
		for (let j = i; !visited[j]; j = ((j + this.heights[j]) % this.period)) {
			orbit.push(this.heights[j]);
			visited[j] = true;
		}
		result.push(orbit);
	}

	return result;
}

toJif(properties)
{
	let nJugglers = properties.nJugglers;
	if (nJugglers === undefined)
		nJugglers = 2;
	let nHands = properties.nHands;
	if (nHands === undefined)
		nHands = nJugglers * 2;
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
	periods.push(nHands);

	const steps = lcmArray(periods);

	const p = {};
	if (properties)
		for (const k in properties)
			p[k] = properties[k];
	p.siteswap = this.toString();
	const heights = this.heights;
	p.nHands = nHands;
	p.nJugglers = nJugglers;
	p.valid = this.isValid();
	if (!p.valid)
		return p;

	const hands = [];
	if (nHands <= 2 * nJugglers) {
		for (let i = 0; i < nHands; i++)
			hands.push({juggler:i % nJugglers, hand: i < nJugglers ? 'right' : 'left'});
	}
	p.hands = hands;

	p.nProps = this.nProps;

	p.timePeriod = steps;
	p.events = [];
	if (this.period < 1)
		return p;

	const eventsAtTime = [];

	for (let i = 0; i < steps; i++) {
		const height = heights[i % this.period];
		const e = {
			type: height ? 'throw' : 'pause',
			time: i,
			duration: height,
			fromHand: i % nHands,
			toHand:  (i + height) % nHands,
			label: Siteswap.heightToChar(height)
		};
		if (p.flipTwos && height == 2 * nJugglers)
			e.spins = 1;

		eventsAtTime.push(e);
		p.events.push(e);
	}

	// label events with propid
	let propid = 0;
	for (let i = 0; i < steps; i++) {
		const e = eventsAtTime[i];
		if (e.prop === undefined && e.duration) {
			let j = i;
			eventsAtTime[j].prop = propid;
			while (j < steps && eventsAtTime[j].duration) {
				j += eventsAtTime[j].duration;
				eventsAtTime[j % steps].prop = propid;
			}

			propid++;
		}
	}

	return p;
}

startConfigurations(nJugglers)
{
	const period = this.period;
	nJugglers = +nJugglers; // force integer
	const startHands = Array.apply(null, Array(nJugglers * 2)).map(function() {return 0;});
	let i = 0;
	const hasProp = [];
	for (var missing = this.nProps; missing > 0; i++) {
		const t = this.heights[i % period];
		if (t > 0) {
			if (!hasProp[i]) {
				startHands[i % (nJugglers * 2)]++;
				missing--;
			}
			hasProp[i + t] = true;
		}
	}
	const result = new Array(nJugglers);
	for (let juggler = 0; juggler < nJugglers; juggler++) {
		const localPeriod = period % nJugglers == 0 ? period / nJugglers : period;
		const local = new Array(localPeriod);
		for (let i = 0; i < localPeriod; i++)
			local[i] = String(this.heights[(juggler + i * nJugglers) % period]);
		const name = function(i) {
			return String.fromCharCode('A'.charCodeAt(0) + i);
		};
		const left = function(i) {
			return (i / nJugglers) & 1;
		};
		result[juggler] = {
			local: local.map(function(t, i) {
				const a = juggler + i * nJugglers;
				const b = a + +t;
				let desc = '';
				if (t % nJugglers) {
					if (nJugglers > 2)
						desc += name(b % nJugglers);
					desc += left(a) == left(b) ? 'X' : '||';
					desc = '<sub>' + desc + '</sub>';
				}
				return {
					height: t,
					siteswap: Siteswap.heightToChar(t),
					desc: desc ? desc : '&nbsp;'
				};
			}),
			name:  name(juggler),
			startPropsRight: startHands[juggler],
			startPropsLeft:  startHands[nJugglers + juggler],
		};
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
 */
static *generate(params)
{
	const min = Math.max(0, Math.min(35, parseInt(params.minThrow) || 0));
	const max = Math.max(0, Math.min(35, parseInt(params.maxThrow) || 0));
	const nProps = Math.max(0, Math.min(35, parseInt(params.nProps) || 0));
	const period = Math.max(1, Math.min(15, parseInt(params.period) || 0));
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
	const excludeFilters = filters(params.exclude);
	const includeFilters = filters(params.include);

	function exclude(str) {
		return excludeFilters.some(function(filter) { return (str + str + str).match(filter);});
	}
	function include(str) {
		return includeFilters.every(function(filter) { return (str + str + str).match(filter);});
	}

	const finalCheck = function(canonic) {
		// check if it is a smaller period which is repeated
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
	while (i >= 0) {
		ops += 1;
		if (ops % 1000 == 0)
			yield; // need to yield regularly so we have a chance to switch to the ui thread from time to time

		if (i == period) {
			const c = Siteswap.heightsToString(heights);
			if (isCanonic(c) && finalCheck(c))
				yield c;

			i--;
		} else {
			const h = heights[i];
			if (h >= 0) {
				landing[(i + h) % period] = 0;
				sum -= h;
				heights[i]++;
			}

			let minT = Math.max(min, nProps * period - sum - (period - i - 1) * max);
			let maxT = Math.min(max, nProps * period - sum - (period - i - 1) * min);
			if (i > 1)
				maxT = Math.min(heights[0], maxT); // otherwise siteswap would not be canonic anymore

			if (h < 0)
				heights[i] = minT;

			while (heights[i] <= maxT + 1 && landing[(i + heights[i]) % period])
				heights[i]++;

			if (heights[i] > maxT) {
				heights[i] = -1;
				i--;
				continue;
			}

			landing[(i + heights[i]) % period] = 1;
			sum += heights[i];

			i++;
		}
	}
}

}
