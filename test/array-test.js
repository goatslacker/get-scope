module.exports = function (getScope, assert, ast) {
  function assertArray(arr) {
    assert.equalsType(arr, 'ArrayExpression')
  }

  function assertElements(arr, els) {
    assert.equal(arr.elements.length, els.length,
      'Mismatch length for ' + arr.elements)

    arr.elements.forEach(function (el, i) {
      assert.equal(el.value, els[i],
        'Mismatch for ' + arr.elements +
        ' expecting ' + el.value + ' got ' + els[i])
    })
  }

  var scope = getScope.forProgram(ast.array)

  return {
    'are all of type ArrayExpression': function () {
      assertArray(scope.a)
      assertArray(scope.b)
      assertArray(scope.c)
    },

    'contains proper elements': function () {
      assertElements(scope.a, [0, 2, 3])
      assertElements(scope.b, [1])
      assertElements(scope.c, [1, 2, 3])
    },

//    'array has properties': function () {
//      assert.equal(scope.c.elements.wtf.value, 'yes')
//    }
  }
}
