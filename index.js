const postcss = require("postcss");
const {parse} = require('postcss-values-parser');

// local tooling
const mediaFnRegExp = /media\([^)]+\)/i;
const isMediaFn = (node) => node.name === 'media';
const isResponsiveValue = (value) => value.length > 1;
const isNonResponsiveValue = (value) => value.length === 1;

/**
 * Use `media()` to assign responsive values.
 * @returns {import('postcss').Plugin}
 */
module.exports = function creator() {
	return {
		postcssPlugin: 'postcss-media-fn',
		Rule(rule) {
			const newAtRules = [];

			rule.walkDecls(
				(decl) => {
					if (!mediaFnRegExp.test(decl.value)) {
						return;
					}

					const valueAST = parse(decl.value);
					valueAST.walkFuncs(
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
											values[values.length - 1].push(childNode.raws.before + childNode.toString() + childNode.raws.after);
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
										const prop = value.pop().trim()
										const media = value.join('').trim()

										// add new @media at-rule, rule, and declaration to list
										newAtRules.push(
											postcss.atRule({
												name: 'media',
												params: media,
												source: decl.source
											}).append(
												rule.clone({
													raws: {
														before: decl.raws.before
													}
												}).removeAll().append(
													decl.clone({
														value: prop,
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
									node.value = nonResponsiveValues.join('');
								} else {
									// otherwise, remove the node
									node.remove()
								}
							}
						}
					);

					const newValue = valueAST.toString()

					// if the value has changed
					if (decl.value !== newValue) {
						// if the new value is empty
						if (!newValue) {
							// remove the declaration
							decl.remove();
						} else {
							// otherwise, update the declaration value
							decl.value = newValue.trim();
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
	}
}

module.exports.postcss = true;
