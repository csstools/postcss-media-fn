module.exports = `
h1 {
	font-size: media(
		10px,
		(min-width:  600px) 20px,
		(min-width:  800px) 30px,
		(min-width: 1000px) 40px,
		(min-width: 1200px) 50px,
		(min-width: 1400px) 60px
	);
	margin: media(
		(min-width:  800px) 0 0 20px,
		(min-width: 1400px) 0 0 40px
	);
}
`;
