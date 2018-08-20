/*
 *  passgenau - a passing siteswap generator
 *  Copyright (C) 2018 Christian Helbling
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

// minimalistic implementation of it_html in js without quoting
// see https://itools.search.ch/ for the original php version
var tag = function (tag, args, content) {
	return function() {
		var i = 0;
		var args = {};
		var content = '';
		if (typeof(arguments[i]) == 'object') {
			args = arguments[i];
			i++;
		}
		for (; i < arguments.length; i++)
			content += arguments[i];

		var attributes = '';
		for (var key in args)
			attributes += ' ' + key + '="' + args[key] + '"';

		return '<' + tag + attributes + '>' + content + '</' + tag + '>';
	};
}
var tags = "a,b,br,button,div,em,fieldset,form,h1,h2,h3,h4,h5,h6,hr,img,input,label,legend,li,meta,noscript,p,pre,small,span,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,tr,ul,ol,article,section,defs,desc,g,image,line,marker,path,pattern,rect,svg,text,textPath,circle".split(',');
for (var i in tags)
	window[tags[i]] = tag(tags[i]);


// template
var causal_diagram = svg(
	{
		':width': 'causal_diagram.width',
		':height': 'causal_diagram.height',
	},
	defs(
		marker({
			'id': 'arrow',
			'markerWidth': 10,
			'markerHeight': 10,
			'refX': 0,
			'refY': 3,
			'orient': 'auto',
			'markerUnits': 'strokeWidth',
			},
			path({
				class: 'arrow_fill',
				d: 'M0,0 L0,6 L9,3 z',
			}),
		)
	),
	rect({
		'x': 0,
		'y': 0,
		':width': 'causal_diagram.width',
		':height': 'causal_diagram.height',
		'stroke': '#ccc',
		'stroke-width': '2px',
		'fill': 'none',
	}),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "10",
		':y'  : "causal_diagram.yoff + 9 + i * causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
	},
	'{{j.name}}',
	),
	circle({
		'v-for': "(n, i) in causal_diagram.nodes",
		':cx'  : "n.x",
		':cy'  : "n.y",
		':r'   : "n.r",
		':class': 'n.class',
		'stroke': 'black',
		'stroke-width': 2,
	}),
	text({
		'v-for': "(n, i) in causal_diagram.nodes",
		':x'  : "n.x",
		':y'  : "n.y + 5",
		'class': 'node_label',
		':class': 'n.class',
		'font-size': 16,
		'stroke-width': '0px',
		'text-anchor': 'middle',
	},
	'{{n.label}}',
	),
	path({
		'class': 'arrow_stroke',
		'v-for': "(n, i) in causal_diagram.nodes",
		'v-if': 'n.arrow',
		':d': 'n.arrow',
		'stroke-width': '2px',
		'fill': 'none',
		'marker-end': "url(#arrow)",
	}),
);

var siteswap_col = [
	div({class:'form-inline'},
		label({
			class:'sr-only',
			for:'siteswap_input',
			}, 'Siteswap',
		),
		div({class:'input-group'},
			div({class:'input-group-prepend'},
				div({class:'input-group-text'},
					'Siteswap',
				),
			),
			input({
				type:'search',
				id:'siteswap_input',
				'v-model':'siteswap_input',
				'v-model':'siteswap_input',
				inputmode:'verbatim',
				pattern:'[0-9a-zA-Z ]+',
				class:'form-control',
				':class': 'validClass',
				size:10,
				placeholder:'Siteswap',
			}),
		),
		label({
			class:'sr-only',
			for:'n_jugglers_input',
			}, 'Number of Jugglers',
		),
		div({class:'input-group n_jugglers'},
			div({class:'input-group-prepend'},
				div({
					class:'input-group-text',
					title:'Number of jugglers',
					}, '👥',
				),
			),
			input({
				type:'number',
				min:1,
				max:9,
				'v-model':'n_jugglers_input',
				inputmode:'number',
				id:'n_jugglers_input',
				class:'form-control',
				size: 1,
			}),
		),
	),
	div({'v-if': 'valid'},
		p(
			'{{n_objects}} objects, period {{period}}',
			span({'v-if': 'n_jugglers > 1'}, ', interface: {{interface}}'),
		 ),
		div({'v-if': 'n_jugglers > 1'},
			h4('Local'),
			table(tr({'v-for': "j in jugglers"}, th('{{j.name}}', sub('{{j.start}}')), td({'v-html':'j.local'}))),
		   ),
		h4('Causal diagram'),
		div({class:'causal_diagram'},
			causal_diagram,
	   ),
	),
].join('');

var template = div({class:'container'},
	div({class:'row'},
		div({class: 'col siteswap'},
			siteswap_col,
		),
		div({class: 'col known_siteswaps'},
			h2('Well-known siteswaps'),
			p(small('© Tilman Sinning, ', a({href: 'https://github.com/namlit/siteswap_generator'}, 'Siteswap Generator'))),
			ul(
				li({'v-for': 's in known_siteswaps'},
					a({href:'#', 'v-on:click':'siteswap_input = s[0]; n_jugglers_input = s[1]'}, span({class:'siteswap'}, '{{s[0]}}'), span({class:'name'}, '{{s[2]}}')),
				),
			),
		),
	),
	div({class:'padding_bottom'}), // add some white space to the page end so that we never loose the scroll position when editing the siteswap
);

var known_siteswaps = [
	["86722", 2, "5 club not why"],
	["86227", 2, "5 club why not"],
	["86867", 2, "5 count popcorn (44)"],
	["a6667", 2, "5 count popcorn"],
	["9964966", 2, "7 club Jim's 2 count"],
	["9964786", 2, "7 club Jim's 2 count (variation)"],
	["9784966", 2, "7 club Jim's 2 count (variation)"],
	["9784786", 2, "7 club Jim's 2 count (variation)"],
	["9969268", 2, "7 club maybe (1)"],
	["9968296", 2, "7 club maybe (2)"],
	["9968278", 2, "7 club maybe (variation)"],
	["7", 2, "7 club one count"],
	["9962968", 2, "7 club not why"],
	["9962788", 2, "7 club not why (variation)"],
	["9782968", 2, "7 club not why (variation)"],
	["9782788", 2, "7 club not why (variation)"],
	["966", 2, "7 club three count"],
	["9968926", 2, "7 club why not"],
	["9788926", 2, "7 club why not (variation)"],
	["8686867", 2, "7 count popcorn"],
	["9668686", 2, "7 count popcorn (variation)"],
	["a666786", 2, "7 count popcorn (variation)"],
	["a666867", 2, "7 count popcorn (variation)"],
	["a666966", 2, "7 count popcorn (variation)"],
	["996", 2, "8 club pps"],
	["9797888", 2, "8 Club Vitoria"],
	["9", 2, "9 club one count"],
	["a2747", 2, "aa7 Warmup Pattern"],
	["9667867", 2, "Aspirin"],
	["756", 2, "baby dragon; zap opus 1; holy hand-grenade"],
	["9968978", 2, "Clean Finish"],
	["726", 2, "coconut laden swallow"],
	["945", 2, "dragon; black beast of aaaarg..."],
	["867", 2, "French 3 count"],
	["7742744", 2, "Flipalot"],
	["86777", 2, "Funky Bookends"],
	["942", 2, "glass elevator"],
	["9792688", 2, "Good Morning"],
	["8882225", 2, "Heffalot"],
	["975", 2, "Holy Grail; zap opus two"],
	["77222", 2, "inverted parsnip"],
	["75724", 2, "Kaatzi"],
	["645", 2, "killer bunny"],
	["774", 2, "Jim's 1 count (async)"],
	["77466", 2, "Jim's 2 count (async)"],
	["77772", 2, "Martin's one count (async)"],
	["86727", 2, "maybe"],
	["96627", 2, "maybe not"],
	["7777266", 2, "Mild Madness (async)"],
	["9789788", 2, "Milk Duds"],
	["9647772", 2, "Odnom"],
	["96672", 2, "not likely"],
	["86772", 2, "not why"],
	["77722", 2, "parsnip"],
	["9669667", 2, "Placebo"],
	["9969788", 2, "Poem"],
	["9968897", 2, "Real Fake Clean Finish"],
	["97428", 2, "The One to Concentrate"],
	["86277", 2, "why not"],
];


var app = new Vue({
	el: '#siteswap',
	template: template,
	data: function() { return {
		siteswap_input: 86277,
		n_jugglers_input: 2,
		known_siteswaps: known_siteswaps,
	};},
	computed: {
		stripped_input: function() {
			return String(this.siteswap_input).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
		},
		siteswap: function() {
			return String(this.stripped_input).split('').map(function(x) {
				return x.match(/[0-9]/) ? +x : x.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
			});
		},
		period: function() {
			return this.siteswap.length;
		},
		n_objects: function() {
			return this.siteswap.reduce(function(a, b) { return a + b}) / this.period;
		},
		n_jugglers: function() {
			var result = parseInt(this.n_jugglers_input);
			if (result >= 10)
				this.n_jugglers_input = result = parseInt(this.n_jugglers_input.slice(-1));
			if (result <= 0)
				this.n_jugglers_input = result = 2;
			return result;
		},
		valid: function() {
			var period = this.period;
			var landing = new Array(period);
			var valid = true;
			this.siteswap.forEach(function(v, k) {
				var pos = (k + v) % period;
				if (landing[pos])
					valid = false;
				landing[pos] = true;
			});
			return period > 0 ? valid : undefined;
		},
		validClass: function() {
			return this.valid == false ? 'text-danger' : '';
		},
		interface: function() {
			var result = new Array(this.period);
			for (var i in this.siteswap) {
				var t = this.siteswap[i];
				result[(+i + +t) % this.period] = (t % this.n_jugglers) ? 'p' : 's';
			}
			return result.join('');
		},
		jugglers: function() {
			var n_jugglers = this.n_jugglers;
			var start_hands = Array.apply(null, Array(n_jugglers * 2)).map(function() {return 0;});
			var i = 0;
			var has_obj = [];
			for (var missing = this.n_objects; missing > 0; i++) {
				var t = this.siteswap[i % this.period];
				if (t > 0) {
					if (!has_obj[i]) {
						start_hands[i % (n_jugglers * 2)]++;
						missing--;
					}
					has_obj[i + t] = true;
				}
			}
			var result = new Array(n_jugglers);
			for (var juggler = 0; juggler < n_jugglers; juggler++) {
				var period = this.period;
				var local = new Array(period);
				for (var i = 0; i < (period % n_jugglers == 0 ? period / n_jugglers : period); i++)
					local[i] = String(this.siteswap[(juggler + i * n_jugglers) % period]);
				var name = function(i) {
					return String.fromCharCode('A'.charCodeAt(0) + i);
				};
				var left = function(i) {
					return (i / n_jugglers) & 1;
				};
				result[juggler] = {
					local: local.map(function(t, i) {
						var a = juggler + i * n_jugglers;
						var b = a + +t;
						var desc = '';
						if (t % n_jugglers) {
							if (n_jugglers > 2)
								desc += name(b % n_jugglers);
							desc += left(a) == left(b) ? 'X' : '||';

							desc = sub(desc);
						}
						return this.output_siteswap([t]) + desc + '&nbsp;';
					}.bind(this)).join(' ',),
					name:  name(juggler),
					start: start_hands[n_jugglers + juggler] + '|' + start_hands[juggler],
				};
			}
			return result;
		},
		causal_diagram: function() {
			var n_jugglers = this.n_jugglers;
			var arrow_length = 20;
			var p = {
				r:    13,
				xoff: 50,
				yoff: 30,
				dx:   70 / n_jugglers,
				dy:   100,
				nodes: [],
			};
			var juggler = function(i) { return (i + n_jugglers * 10) % n_jugglers;};
			var x  = function(i) { return p.xoff + i * p.dx;};
			var y  = function(i) { return p.yoff + juggler(i) * p.dy;};
			var xy = function(i, shorten, towards_x, towards_y) {
				var X = x(i);
				var Y = y(i);
				if (shorten) {
					var dx = towards_x - X;
					var dy = towards_y - Y;
					var len = Math.sqrt(dx * dx + dy * dy);
					X += shorten * dx / len;
					Y += shorten * dy / len;
				}
				return X + ',' + Y;
			}

			var arrow = function(i, step) {
				var j = i + step;
				var ji = juggler(i);
				var jj = juggler(j);
				if (ji != jj || Math.abs(step) == n_jugglers)
					return "M" + xy(i, p.r, x(j), y(j)) + " L" + xy(j, p.r + arrow_length, x(i), y(i));
				var dir_x = x(j) > x(i) ? 1 : -1;
				var dir_y = ji ? -1 : 1;

				var offset_x = dir_x * p.dy / 2;
				var offset_y = dir_y * p.dy / 2;

				var control_point1 = (x(i) + offset_x) + "," + (y(i) + offset_y);
				var control_point2 = (x(j) - offset_x) + "," + (y(i) + offset_y);
				return "M" + xy(i, p.r, x(i) + dir_x, y(i) + dir_y)
				     + "C" + control_point1
				     + " " + control_point2
				     + " " + xy(j, p.r + arrow_length, x(j) - dir_x, y(i) + dir_y);
			};
			p.steps = n_jugglers * this.period * 2;
			for (var i = 0; i < p.steps; i++) {
				var pos = i % this.period;
				var cur_throw = this.siteswap[pos];
				p.nodes.push({
					r: p.r,
					x: x(i),
					y: y(i),
					class: (Math.floor(i / n_jugglers) % 2) ? 'left_hand' : 'right_hand',
					juggler: juggler(i),
					label: this.output_siteswap(this.siteswap).charAt(pos),
					arrow: cur_throw ? arrow(i, this.siteswap[pos] - 2 * n_jugglers) : undefined, // for ladder diagram: don't subtract 2 * n_jugglers
				});
			}

			p.width  =  p.steps * p.dx + 50;
			p.height = (this.n_jugglers - (this.n_jugglers > 1 ? 1 : 0.5)) * p.dy + 2 * p.yoff;
			return p;
		},
	},
	methods: {
		output_siteswap: function(siteswap) {
			return siteswap.map(function(x) {
				x = +x;
				return x <= 9 ? String(x) : String.fromCharCode('a'.charCodeAt(0) + x - 10);
			}).join('');
		},
	},
	mounted: function() {
		var siteswap = localStorage.getItem('siteswap');
		if (siteswap)
			this.siteswap_input = siteswap;
		var n_jugglers = localStorage.getItem('n_jugglers');
		if (n_jugglers)
			this.n_jugglers_input = n_jugglers;
	},
	watch: {
		siteswap_input: {
			handler() {
				localStorage.setItem('siteswap', this.siteswap_input);
			},
		},
		n_jugglers_input: {
			handler() {
				localStorage.setItem('n_jugglers', this.n_jugglers_input);
			},
		},
	},
});
