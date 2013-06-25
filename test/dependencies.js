var fs = require('fs')
var esprima = require('esprima')

function loadAndParse(str) {
  var code = String(fs.readFileSync('test/fixtures/array.js'))
  return esprima.parse(code)
}

module.exports = {
  ast: {
    array: loadAndParse('test/fixtures/array.js')
  },
  getScope: require('../')
}
