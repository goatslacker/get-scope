module.exports = function (getScope, assert, ast, str) {
  var globalScope = getScope.forProgram(ast.fns)

  function assertType(x, type) {
    assert.equal(x.type, type,
      'Expected type ' + x.type + ' but received ' + type)
  }

  return {
    'function scope': function () {
      var param = [{ type: 'Literal', value: 2 }]
      var localScope = getScope.forFunction(globalScope.b, globalScope, param)

      function assertExists(x) {
        assert(localScope.hasOwnProperty(x),
          'Property ' + x + ' does not exist')
      }

      assertExists('c')
      assertExists('d')
      assertExists('a')
      assertExists('obj')
      assertExists('g')
      assertExists('x')

      assertType(localScope.c, 'Literal')
      assertType(localScope.d, 'Literal')
      assertType(localScope.a, 'Literal')
      assertType(localScope.obj, 'ObjectExpression')
      assertType(localScope.g, 'FunctionDeclaration')
      assertType(localScope.x, 'Literal')
    }
  }
}
