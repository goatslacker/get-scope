module.exports = function (getScope, assert, ast, fu, str) {
  var scope = getScope.forProgram(ast.chain)

  function assertChain(expected, actual) {
    assert.equal(expected, actual,
      'Failed to assert ' +
      ' expected ' + expected + ' actual ' + str(actual))
  }

  function getPropertyValue(x) {
    return x.name || x.value
  }

  function assertChainedObject(expected, chain) {
    var actual = fu.foldl(function (obj, prop) {
      return obj.properties.filter(function (x) {
        var key = getPropertyValue(x.key)
        return key === prop
      }).pop().value
    }, chain).value

    assertChain(expected, actual)
  }

  function assertChainedArray(expected, chain) {
    var actual = fu.foldl(function (obj, prop) {
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
