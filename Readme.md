# pdf-combine

Setup:

brew install poppler

npm install pdf-combine

```javascript

var combinePdfs = require('alternative-pdf-combine')
combinePdfs([
	fs.readFileSync('pdf1.pdf'),
	{file: 'pdf2.pdf'}, // will automatically call fs.readFileSync
	new Buffer('...'),  // will use this buffer
	'...', // will be converted to Buffer using new Buffer(txt)
	{text: '...', encoding: 'utf8'} // will convert the  text to a buffer using new Buffer(obj.text, obj.encoding)
], function (err, combinedBuffer) {
	if (err) {
		console.log(err)
		process.exit(1)
	}
	fs.writeFile('test_out.pdf', combinedBuffer, function (err) {
		if (err) {
			console.log(err)
			process.exit(1)
		}
		console.log(out)
	})
})

```

This uses pdfUnite from the poppler package