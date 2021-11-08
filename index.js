const postcss = require('postcss');
const { parse } = require('postcss-values-parser');

// local tooling
const mediaFnRegExp = /media\([^)]+\)/i;
const isMediaFn = (node) => node.name === 'media';
const isResponsiveValue = (value) => value.length > 1 && /^\s*\([^)]+\)\s*$/i.test(value[0]);

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
								const allValues = postcss.list.comma(node.params.slice(1, -1))
									.map(item => postcss.list.space(item));

								// responsive values
								const responsiveValues = allValues.filter((value) => isResponsiveValue(value));

								// non-responsive values
								const nonResponsiveValues = allValues.filter((value) => !isResponsiveValue(value));

								// for each responsive value
								responsiveValues.forEach(
									(value) => {
										const media = value.shift().trim()
										const prop = value.join('').trim()

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
									node.value = nonResponsiveValues.shift().join('');
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
