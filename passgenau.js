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
var tags = "a,b,br,button,div,em,fieldset,form,h1,h2,h3,h4,h5,h6,hr,img,input,label,legend,li,meta,noscript,p,pre,span,style,table,tbody,td,textarea,tfoot,th,thead,tr,ul,ol,article,section,defs,desc,g,image,line,marker,path,pattern,rect,svg,text,textPath,circle".split(',');
for (var i in tags)
	window[tags[i]] = tag(tags[i]);

// component with handy siteswap information like starting position, causal diagram, ...
Vue.component('siteswap-component', {
	template: div(
		p(label('Siteswap: ',  input({type:'text', 'v-model':'siteswap_input',   inputmode:'verbatim', pattern:'[0-9a-zA-Z ]+', ':class': 'validClass'}))),
		p(label('#Jugglers: ', input({type:'text', 'v-model':'n_jugglers_input', inputmode:'number',   pattern:'[0-9]+', size: 1,}))),
		div({'v-if': 'valid'},
			table(
				tr(td('#Objects'), td('{{n_objects}}')),
				tr(td('Period'),   td('{{period}}')),
			),
			h4('Local'),
			table(tr({'v-for': "j in jugglers"}, td('{{j.name}}'), td('{{j.local}}'))),

			h4('Causal diagram'),
			svg({
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
							'd': 'M0,0 L0,6 L9,3 z',
							'fill': 'blue'
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
					'stroke': 'black',
					'stroke-width': 2,
					':fill': 'n.fill',
				}),
				text({
					'v-for': "(n, i) in causal_diagram.nodes",
					':x'  : "n.x",
					':y'  : "n.y + 5",
					'font-size': 16,
					'stroke-width': '0px',
					'text-anchor': 'middle',
					'stroke': 'black',
					},
					'{{n.label}}',
				),
				path({
					'v-for': "(n, i) in causal_diagram.nodes",
					'v-if': 'n.arrow',
					':d': 'n.arrow',
					'stroke-width': '2px',
					'stroke': 'blue',
					'fill': 'none',
					'marker-end': "url(#arrow)",
				}),
			),
		),
	),
	data: function() { return {
		siteswap_input: 86277,
		n_jugglers_input: 2,
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
			if (this.n_jugglers_input !== '' && result == 0)
				this.n_jugglers_input = 2;
			return result == 0 ? 2 : result;
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
		jugglers: function() {
			var result = new Array(this.n_jugglers);
			for (var juggler = 0; juggler < this.n_jugglers; juggler++) {
				var period = this.period;
				var local = new Array(period);
				for (var i = 0; i < (period % this.n_jugglers == 0 ? period / this.n_jugglers : period); i++)
					local[i] = this.siteswap[(juggler + i * this.n_jugglers) % period];
				result[juggler] = {
					local: this.output_siteswap(local),
					name:  String.fromCharCode('A'.charCodeAt(0) + juggler),
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
					fill: (Math.floor(i / n_jugglers) % 2) ? '#ccc' : 'white',
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
				return x <= 9 ? String(x) : String.fromCharCode('a'.charCodeAt(0) + x - 10);
			}).join('');
		},
	},
});

var app = new Vue({el: '#siteswap'});
