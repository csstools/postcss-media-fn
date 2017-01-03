# Media() <a href="https://github.com/postcss/postcss"><img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS Logo" width="90" height="90" align="right"></a>

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Licensing][lic-image]][lic-url]
[![Changelog][log-image]][log-url]
[![Gitter Chat][git-image]][git-url]

[Media()] lets you use the `media()` function to assign responsive values to a declaration.

```css
/* before */

h1 {
	font-size: media(
		16px,
		(min-width:  600px) 20px,
		(min-width: 1000px) 40px,
		(min-width: 1400px) 60px
	);
}


/* after */

h1 {
	font-size: 16px;
}

@media (min-width: 600px) {
	h1 {
		font-size: 20px;
	}
}

@media (min-width: 1000px) {
	h1 {
		font-size: 40px;
	}
}

@media (min-width: 1400px) {
	h1 {
		font-size: 60px;
	}
}
```

## Usage

Add [Media()] to your build tool:

```bash
npm install postcss-media-fn --save-dev
```

#### Node

```js
require('postcss-media-fn').process(YOUR_CSS, { /* options */ });
```

#### PostCSS

Add [PostCSS] to your build tool:

```bash
npm install postcss --save-dev
```

Load [Media()] as a PostCSS plugin:

```js
postcss([
	require('postcss-media-fn')({ /* options */ })
]).process(YOUR_CSS, /* options */);
```

#### Gulp

Add [Gulp PostCSS] to your build tool:

```bash
npm install gulp-postcss --save-dev
```

Enable [Media()] within your Gulpfile:

```js
var postcss = require('gulp-postcss');

gulp.task('css', function () {
	return gulp.src('./src/*.css').pipe(
		postcss([
			require('postcss-media-fn')({ /* options */ })
		])
	).pipe(
		gulp.dest('.')
	);
});
```

#### Grunt

Add [Grunt PostCSS] to your build tool:

```bash
npm install grunt-postcss --save-dev
```

Enable [Media()] within your Gruntfile:

```js
grunt.loadNpmTasks('grunt-postcss');

grunt.initConfig({
	postcss: {
		options: {
			use: [
				require('postcss-media-fn')({ /* options */ })
			]
		},
		dist: {
			src: '*.css'
		}
	}
});
```

[npm-url]: https://www.npmjs.com/package/postcss-media-fn
[npm-img]: https://img.shields.io/npm/v/postcss-media-fn.svg
[cli-url]: https://travis-ci.org/jonathantneal/postcss-media-fn
[cli-img]: https://img.shields.io/travis/jonathantneal/postcss-media-fn.svg
[lic-url]: LICENSE.md
[lic-image]: https://img.shields.io/npm/l/postcss-media-fn.svg
[log-url]: CHANGELOG.md
[log-image]: https://img.shields.io/badge/changelog-md-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[git-image]: https://img.shields.io/badge/chat-gitter-blue.svg

[Media()]: https://github.com/jonathantneal/postcss-media-fn
[PostCSS]: https://github.com/postcss/postcss
[Gulp PostCSS]: https://github.com/postcss/gulp-postcss
[Grunt PostCSS]: https://github.com/nDmitry/grunt-postcss
