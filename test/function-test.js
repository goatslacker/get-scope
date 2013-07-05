module.exports = function (getScope, assert, ast, str) {
  var globalScope = getScope.forProgram(ast.fns)

  return {
    'function scope': function () {
      var param = [{ type: 'Literal', value: 2 }]
      var localScope = getScope.forFunction(globalScope.b, globalScope, param)
      var assertExists = assert.genExistsInScope(localScope)

      assertExists('c')
      assertExists('d')
      assertExists('a')
      assertExists('obj')
      assertExists('g')
      assertExists('x')

      assert.equalsType(localScope.c, 'Literal')
      assert.equalsType(localScope.d, 'Literal')
      assert.equalsType(localScope.a, 'Literal')
      assert.equalsType(localScope.obj, 'ObjectExpression')
      assert.equalsType(localScope.g, 'FunctionDeclaration')
      assert.equalsType(localScope.x, 'Literal')
    }
  }
}
