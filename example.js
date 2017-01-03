/*
 * Add your CSS code here.
 * See https://github.com/jonathantneal/postcss-media-fn#features for more examples
 */

const css = `
h1 {
	font-size: media(
		16px,
		(min-width:  600px) 20px,
		(min-width: 1000px) 40px,
		(min-width: 1400px) 60px
	);
}
`;

/*
 * Add your process configuration here; see
 * http://api.postcss.org/global.html#processOptions for more details.
 */

const processOptions = {};

/*
 * Process the CSS and log it to the console.
 */

require('postcss-media-fn').process(css, {}, processOptions).then(result => {
	console.log(result.css);
});
