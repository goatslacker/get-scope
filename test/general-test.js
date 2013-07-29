module.exports = function (getScope, assert, ast) {
  var scope = getScope.forProgram(ast.general)
  var assertExists = assert.genExistsInScope(scope)

  return {
    'is in scope': function () {
      assertExists.many('a', 'b', 'c', 'd', 'e')
    },

    'correct types': function () {
      assert.equalsType(scope.a, 'Literal')
      assert.equalsType(scope.b, 'FunctionDeclaration')
      assert.equalsType(scope.c, 'Literal')
    },

    'literal values': function () {
      assert.equal(scope.a.value, 1)
      assert.equal(scope.c.value, 3)
    }
  }
}
