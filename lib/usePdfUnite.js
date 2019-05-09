var PDF_UNITE = 'pdfunite'
var commandExits = require('command-exists')

module.exports = function (debug, callback) {
  commandExits(PDF_UNITE, function (err, exists) {
    if (err && debug) {
      console.log('[debug] Error feedback from command-exists: ' + err)
    }
    if (!exists) {
      callback(new Error('pdfunite not found. On mac please install with brew install poppler.'))
    } else {
      callback(null, exists ? PDF_UNITE : null)
    }
  })
}
