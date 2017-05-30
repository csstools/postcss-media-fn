// tooling
const postcss = require('postcss');
const parser = require('postcss-value-parser');

// local tooling
const isLikelyMediaFn = (node) => node.type === 'decl' && (/media\([^\)]+\)/).test(node.value);
const isMediaFn = (node) => node.type === 'function' && node.value === 'media';
const isResponsiveValue = (value) => value.length > 1;
const isNonResponsiveValue = (value) => value.length === 1;

// plugin
module.exports = postcss.plugin('postcss-media-fn', () => (css) => {
	css.walkRules(
		(rule) => {
			const newAtRules = [];

			Array.prototype.filter.call(rule.nodes, isLikelyMediaFn).forEach(
				(decl) => {
					const newValue = parser(decl.value).walk(
						(node) => {
							if (isMediaFn(node)) {
								// all values
								const allValues = node.nodes.reduce(
									(values, childNode) => {
										// if the node is a dividing comma
										if (childNode.value === ',') {
											// create a new values sub-group
											values.push([]);
										} else {
											// otherwise, assign the stringified node to the last values sub-group
											values[values.length - 1].push(parser.stringify(childNode));
										}

										return values;
									},
									[[]]
								);

								// responsive values
								const responsiveValues = allValues.filter(isResponsiveValue);

								// non-responsive values
								const nonResponsiveValues = allValues.filter(isNonResponsiveValue);

								// for each responsive value
								responsiveValues.forEach(
									(value) => {
										// add new @media at-rule, rule, and declaration to list
										newAtRules.push(
											postcss.atRule({
												name: 'media',
												params: value.shift().trim(),
												source: decl.source
											}).append(
												rule.clone({
													raws: {
														before: decl.raws.before
													}
												}).removeAll().append(
													decl.clone({
														value: value.join('').trim(),
														raws: {}
													})
												)
											)
										);
									}
								);

								// if there non-responsive values
								if (nonResponsiveValues.length) {
									// re-assign the first non-responsive value to the declaration
									node.type = 'word';
									node.value = nonResponsiveValues.shift().join('');
								} else {
									// otherwise, remove the node
									node.type = 'word';
									node.value = '';
								}
							}
						}
					).toString();

					// if the value has changed
					if (decl.value !== newValue) {
						// if the new value is empty
						if (!newValue) {
							// remove the declaration
							decl.remove();
						} else {
							// otherwise, update the declaration value
							decl.value = newValue;
						}
					}
				}
			);

			if (newAtRules.length) {
				rule.parent.insertAfter(rule, newAtRules);

				if (!rule.nodes.length) {
					rule.remove();
				}
			}
		}
	);
});
