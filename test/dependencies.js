var esprima = require('esprima')
var fs = require('fs')
var fu = require('fu')
var util = require('util')

function loadAndParse(str) {
  var code = String(fs.readFileSync('test/fixtures/' + str + '.js'))
  return esprima.parse(code)
}

module.exports = function (assert) {
  assert.extend({
    equalsType: function (x, type) {
      assert.equal(x.type, type,
        'Expected type ' + x.type + ' but received ' + type)
    },
    genExistsInScope: function (scope) {
      function existsInScope(x) {
        assert(scope.hasOwnProperty(x), 'Property ' + x + ' does not exist')
      }
      existsInScope.many = function (args) {
        fu.map(existsInScope, [].slice.call(arguments, 0))
      }

      return existsInScope
    }
  })

  return {
    ast: {
      array: loadAndParse('array'),
      object: loadAndParse('object'),
      chain: loadAndParse('chain'),
      general: loadAndParse('general'),
      fns: loadAndParse('function')
    },
    fu: require('fu'),
    getScope: require('../'),
    util: util,
    str: function (v) {
      return util.inspect(v, false, Infinity)
    }
  }
}
