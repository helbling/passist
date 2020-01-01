/*
 *  passist - passing siteswap assistant
 *  Copyright (C) 2019 Christian Helbling
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

function Siteswap(input) {
	if (Array.isArray(input))
		this.heights = input;
	else
		this.heights = String(input).split('').map(function(x) {
			return x.match(/[0-9]/) ? +x : x.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
		});
	this.period = this.heights.length;
	this.objects = this.heights.reduce(function(a, b) { return a + b}, 0) / this.period;
};

Siteswap.height_to_char = function(x) {
	x = +x;
	return x <= 9 ? String(x) : String.fromCharCode('a'.charCodeAt(0) + x - 10);
}
Siteswap.heights_to_string = function(heights) {
	return heights.map(Siteswap.height_to_char).join('');
}

Siteswap.prototype = {
	is_valid: function() {
		var landing = new Array(this.period);
		var valid = true;
		this.heights.forEach(function(v, k) {
			var pos = (k + v) % this.period;
			if (landing[pos])
				valid = false;
			landing[pos] = true;
		}.bind(this));
		return this.period > 0 ? valid : undefined;
	},
	to_string: function() {
		return Siteswap.heights_to_string(this.heights);
	},
	shift: function(times) {
		if (typeof times === "undefined")
			times = 1;
		times = ((times % this.period)+ this.period) % this.period; // assert 0 <= times < this.period
		var heights = this.heights.slice(0); // clone
		for (; times > 0; times--) {
			var first = heights.shift();
			heights.push(first);
		}
		return new Siteswap(heights);
	},
	all_shifts: function() {
		var shifts = [];
		for (var i = 0; i < this.period; i++)
			shifts.push(new Siteswap(this.heights.slice(i).concat(this.heights.slice(0, i))));
		return shifts;
	},
	canonic_string: function() {
		return this.all_shifts().map(function(s) { return s.to_string();}).sort()[this.period - 1];
	},
	get_start_properties: function(n_jugglers) {
		var rethrows_by_hand = Array.apply(null, Array(n_jugglers * 2)).map(function() {return 0;});
		var i = 0;
		var has_landing = [];
		var is_ground_state = 1;
		var squeezes = 0;
		for (var missing = this.objects; missing > 0; i++) {
			var t = this.heights[i % this.period];
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
	},
	global_interface: function(n_jugglers) {
		var result = new Array(this.period);
		for (var i in this.heights) {
			var t = this.heights[i];
			result[(+i + +t) % this.period] = (t % n_jugglers) ? 'p' : 's';
		}
		return result.join('');
	},
	orbits: function() {
		var visited = [];
		var result = [];
		for (var i in this.heights) {
			if (visited[i])
				continue;

			var orbit = [];
			for (var j = i; !visited[j]; j = (j + this.heights[j]) % this.period) {
				orbit.push(this.heights[j]);
				visited[j] = true;
			}
			result.push(orbit);
		}

		return result;
	}
};
