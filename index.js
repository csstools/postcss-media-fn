// tooling
const postcss = require('postcss');
const parser = require('postcss-value-parser');

// local tooling
const isLikelyMediaFn = (decl) => (/media\([^\)]+\)/).test(decl.value);
const isMediaFn = (node) => node.type === 'function' && node.value === 'media';
const isResponsiveValue = (value) => value.length > 1;
const isNonResponsiveValue = (value) => value.length === 1;

// plugin
module.exports = postcss.plugin('postcss-media-fn', () => (css) => {
	css.walkDecls(
		(decl) => {
			// if the decl likely contains a media() function
			if (isLikelyMediaFn(decl)) {
				const newValue = parser(decl.value).walk(
					(node) => {
						if (isMediaFn(node)) {
							// all values
							const allValues = node.nodes.reduce((values, childNode) => {
								// if the node is a dividing comma
								if (childNode.value === ',') {
									// create a new values sub-group
									values.push([]);
								} else {
									// otherwise, assign the stringified node to the last values sub-group
									values[values.length - 1].push(parser.stringify(childNode));
								}

								return values;
							}, [[]]);

							// responsive values
							const responsiveValues = allValues.filter(isResponsiveValue);

							// non-responsive values
							const nonResponsiveValues = allValues.filter(isNonResponsiveValue);

							// for each responsive value
							responsiveValues.reverse().forEach(
								(value) => {
									// create a new @media at-rule as the first part of the responsive value
									const newAtRule = postcss.atRule({
										name: 'media',
										params: value.shift()
									});

									// clone the declaration using
									const newDecl = decl.cloneAfter({
										value: value.join('').trim()
									});

									// replace the new declaration with the @media at-rule containing it
									newDecl.replaceWith(newAtRule);

									newAtRule.append(newDecl);
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
		}
	);
});

// override plugin#process
module.exports.process = function (cssString, pluginOptions, processOptions) {
	return postcss([
		0 in arguments ? module.exports(pluginOptions) : module.exports()
	]).process(cssString, processOptions);
};
