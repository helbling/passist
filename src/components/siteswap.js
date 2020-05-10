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
	this.n_props = this.period > 0 ? this.heights.reduce(function(a, b) { return a + b; }, 0) / this.period : 0;
}

static height_to_char(x)
{
	x = +x;
	return x <= 9 ? String(x) : String.fromCharCode('a'.charCodeAt(0) + x - 10);
}

static heights_to_string(heights)
{
	return heights.map(Siteswap.height_to_char).join('');
}

is_valid()
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

to_string()
{
	return Siteswap.heights_to_string(this.heights);
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


all_shifts()
{
	const shifts = [];
	for (let i = 0; i < this.period; i++)
		shifts.push(new Siteswap(this.heights.slice(i).concat(this.heights.slice(0, i))));
	return shifts;
}

canonic_string()
{
	return this.all_shifts().map(function(s) { return s.to_string();}).sort()[this.period - 1];
}

get_start_properties(n_jugglers)
{
	const rethrows_by_hand = Array.apply(null, Array(n_jugglers * 2)).map(function() {return 0;});
	let i = 0;
	const has_landing = [];
	let is_ground_state = 1;
	let squeezes = 0;
	for (let missing = this.n_props; missing > 0; i++) {
		const t = this.heights[i % this.period];
		if (t > 0) {
			var hand = i % (n_jugglers * 2);
			if (has_landing[i]) {
				rethrows_by_hand[i % (n_jugglers * 2)]++;
				is_ground_state = 0;
			} else {
				squeezes += rethrows_by_hand[hand];
				rethrows_by_hand[hand] = 0;
				missing--;
			}
			has_landing[i + t] = true;
		}
	}
	return {
		is_ground_state: is_ground_state,
		squeezes: squeezes,
		starts_with_pass: this.heights[0] % n_jugglers ? 1 : 0
	};
}

global_interface(n_jugglers)
{
	const result = new Array(this.period);
	for (const i in this.heights) {
		const t = this.heights[i];
		result[(+i + +t) % this.period] = (t % n_jugglers) ? 'p' : 's';
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

to_jif(properties)
{
	let n_jugglers = properties.n_jugglers;
	if (n_jugglers === undefined)
		n_jugglers = 2;
	let n_hands = properties.n_hands;
	if (n_hands === undefined)
		n_hands = n_jugglers * 2;
	function lcm_array(array) {
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
	periods.push(n_hands);

	const steps = lcm_array(periods);

	const p = {};
	if (properties)
		for (const k in properties)
			p[k] = properties[k];
	p.siteswap = this.to_string();
	const heights = this.heights;
	p.n_hands = n_hands;
	p.n_jugglers = n_jugglers;
	const hands = [];
	if (n_hands <= 2 * n_jugglers) {
		for (let i = 0; i < n_hands; i++)
			hands.push({juggler:i % n_jugglers, hand: i < n_jugglers ? 'right' : 'left'});
	}
	p.hands = hands;

	p.n_props = this.n_props;

	p.time_period = steps;
	p.events = [];
	if (this.period < 1)
		return p;

	for (let i = 0; i < steps; i++) {
		const height = heights[i % this.period];
		p.events.push({
			type: 'throw',
			time: i,
			duration: height,
			from_hand: i % n_hands,
			to_hand: (i + height) % n_hands,
			label: Siteswap.height_to_char(height)
		})
	}

	let propid = 0;
	for (let i = 0; i < steps; i++) {
		const prop = p.events[i].prop;
		if (prop === undefined) {
			let j = i;
			p.events[j].prop = propid;
			while (j < steps && p.events[j].duration) {
				j += p.events[j].duration;
				p.events[j % steps].prop = propid;
			}

			propid++;
		}
	}

	return p;
}

start_configurations(n_jugglers)
{
	const period = this.period;
	n_jugglers = +n_jugglers; // force integer
	const start_hands = Array.apply(null, Array(n_jugglers * 2)).map(function() {return 0;});
	let i = 0;
	const has_obj = [];
	for (var missing = this.n_props; missing > 0; i++) {
		const t = this.heights[i % period];
		if (t > 0) {
			if (!has_obj[i]) {
				start_hands[i % (n_jugglers * 2)]++;
				missing--;
			}
			has_obj[i + t] = true;
		}
	}
	const result = new Array(n_jugglers);
	for (let juggler = 0; juggler < n_jugglers; juggler++) {
		const local_period = period % n_jugglers == 0 ? period / n_jugglers : period;
		const local = new Array(local_period);
		for (let i = 0; i < local_period; i++)
			local[i] = String(this.heights[(juggler + i * n_jugglers) % period]);
		const name = function(i) {
			return String.fromCharCode('A'.charCodeAt(0) + i);
		};
		const left = function(i) {
			return (i / n_jugglers) & 1;
		};
		result[juggler] = {
			local: local.map(function(t, i) {
				const a = juggler + i * n_jugglers;
				const b = a + +t;
				let desc = '';
				if (t % n_jugglers) {
					if (n_jugglers > 2)
						desc += name(b % n_jugglers);
					desc += left(a) == left(b) ? 'X' : '||';
					desc = '<sub>' + desc + '</sub>';
				}
				return {
					height: t,
					siteswap: Siteswap.height_to_char(t),
					desc: desc ? desc : '&nbsp;'
				};
			}),
			name:  name(juggler),
			start_obj_right: start_hands[juggler],
			start_obj_left:  start_hands[n_jugglers + juggler],
		};
	}
	return result;
}

/*
 * generate siteswaps
 * params:
 *  min_throw  minimal throw height
 *  max_throw  maximal throw height
 *  n_objects  number of objects
 *  period     siteswap period
 *  n_jugglers number of jugglers
 *  include    regular expression the global siteswap must match
 *  exclude    regular expression the global siteswap must not match
 */
static *generate(params)
{
	let min = Math.max(0, Math.min(35, parseInt(params.min_throw)));
	let max = Math.max(0, Math.min(35, parseInt(params.max_throw)));
	const n_objects = Math.max(0, Math.min(35, parseInt(params.n_objects)));
	const period = Math.max(1, Math.min(15, parseInt(params.period)));
	const n_jugglers = Math.max(1, Math.min(9, parseInt(params.n_jugglers)));

	min = min || 0;
	max = max || 0;

	function is_canonic(siteswap) {
		const shifts = [];
		for (let i = 0; i < period; i++)
			shifts.push(siteswap.slice(i) + siteswap.slice(0, i));
		return shifts.sort()[period - 1] == siteswap;
	}
	function get_height(siteswap, i) {
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
			if (i % n_jugglers)
				passes.push(i);
			else
				selfs.push(i);
		}
		input = input.trim().replace(/s/gi, '[' + selfs.join('') + ']').replace(/p/gi, '[' + passes.join('') + ']');
		return input ? input.split(/ /) : [];
	}
	const exclude_filters = filters(params.exclude);
	const include_filters = filters(params.include);

	function exclude(str) {
		return exclude_filters.some(function(filter) { return (str + str + str).match(filter);});
	}
	function include(str) {
		return include_filters.every(function(filter) { return (str + str + str).match(filter);});
	}

	const final_check = function(canonic) {
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

		if (n_jugglers > 1) {
			// TODO: check if there is at least one pass for every juggler (example: a56 for 3 jugglers makes C do only flips)

			let n_passes = 0;
			for (let i = 0; i < period; i++) {
				if (get_height(canonic, i) % n_jugglers)
					n_passes++;
			}
			// TODO: let user specify n_passes range
			if (n_passes == 0)
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
	while (i >= 0) {
		if (i == period) {
			const c = Siteswap.heights_to_string(heights);
			if (is_canonic(c) && final_check(c))
				yield c;

			i--;
		} else {
			const h = heights[i];
			if (h >= 0) {
				landing[(i + h) % period] = 0;
				sum -= h;
				heights[i]++;
			}

			let min_t = Math.max(min, n_objects * period - sum - (period - i - 1) * max);
			let max_t = Math.min(max, n_objects * period - sum - (period - i - 1) * min);
			if (i > 1)
				max_t = Math.min(heights[0], max_t); // otherwise siteswap would not be canonic anymore

			if (h < 0)
				heights[i] = min_t;

			while (heights[i] <= max_t + 1 && landing[(i + heights[i]) % period])
				heights[i]++;

			if (heights[i] > max_t) {
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
