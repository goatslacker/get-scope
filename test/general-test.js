module.exports = function (getScope, assert, ast) {
  var scope = getScope.forProgram(ast.general)

  function assertExists(x) {
    assert(scope.hasOwnProperty(x), 'Property ' + x + ' does not exist')
  }

  function assertType(x, type) {
    assert.equal(x.type, type,
      'Expected type ' + x.type + ' but received ' + type)
  }

  return {
    'is in scope': function () {
      assertExists('a')
      assertExists('b')
      assertExists('c')
    },

    'correct types': function () {
      assertType(scope.a, 'Literal')
      assertType(scope.b, 'FunctionDeclaration')
      assertType(scope.c, 'Literal')
    },

    'literal values': function () {
      assert.equal(scope.a.value, 1)
      assert.equal(scope.c.value, 3)
    }
  }
}
