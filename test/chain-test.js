module.exports = function (getScope, assert, ast, fn, str) {
  var scope = getScope.forProgram(ast.chain)

  function assertChain(expected, actual) {
    assert.equal(expected, actual,
      'Failed to assert ' +
      ' expected ' + expected + ' actual ' + str(actual))
  }

  function assertChainedObject(expected, chain) {
    var actual = fn.foldl(function (obj, prop) {
      return obj.properties.filter(function (x) {
        var key = fn.getPropertyValue(x.key)
        return key === prop
      }).pop().value
    }, chain).value

    assertChain(expected, actual)
  }

  function assertChainedArray(expected, chain) {
    var actual = fn.foldl(function (obj, prop) {
      return obj.elements[prop]
    }, chain).value

    assertChain(expected, actual)
  }

  return {
    'chained array': function () {
      assertChainedArray(0, [scope.d, 0, 1])
    },

    'chained object': function () {
      assertChainedObject(2, [scope.a, 'b', 'c'])
    }
  }
}
